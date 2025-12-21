import { PrismaClient, Permission } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const getShareLink = async ({
  permission,
  sharedUserMail,
  contentId,
  userId,
}: {
  permission: Permission;
  sharedUserMail: string;
  contentId: string;
  userId: string;
}) => {
  const email = sharedUserMail.toLowerCase().trim();
  const existingLink = await prisma.shareLink.findFirst({
    where: {
      contentId,
      userId,
    },
    select: {
      id: true,
      contentId: true,
      hash: true,
      sharedUsers: {
        select: {
          id: true,
          email: true,
          permission: true,
        },
      },
    },
  });

  if (existingLink) {
    const isAlreadyShared = existingLink.sharedUsers.find(
      (u) => u.email === email
    );
    if (isAlreadyShared) {
      return {
        hash: existingLink.hash,
        sharedUserMail: isAlreadyShared.email,
        permission: isAlreadyShared.permission,
        shareId: existingLink.id,
        sharedUserId: isAlreadyShared.id
      };
    }

    const giveAccess = await prisma.sharedUser.create({
      data: {
        email: email,
        shareId: existingLink.id,
        permission: permission ? permission : "VIEW",
      },
    });

    return {
        hash: existingLink.hash,
        sharedUserMail: giveAccess.email,
        permission: giveAccess.permission,
        shareId: existingLink.id,
        sharedUserId: giveAccess.id
      }; 
  }

  const token = crypto.randomBytes(32).toString("base64url");

  const createShareLink = await prisma.shareLink.create({
    data: {
      hash: token,
      contentId: contentId,
      userId: userId,
    },
  });

  const giveAccess = await prisma.sharedUser.create({
    data: {
        email: email,
        shareId: createShareLink.id,
        permission: permission ? permission : "VIEW"
    }
  })

  return {
    hash: createShareLink.hash,
    sharedUserMail: giveAccess.email,
    permission: giveAccess.permission,
    shareId: createShareLink.id,
    sharedUserId: giveAccess.id
  };
};