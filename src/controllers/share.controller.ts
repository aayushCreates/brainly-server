import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { getShareLink } from "@/utils/shareLink.utils";
import transporter from "@/utils/mailer.utils";

const prisma = new PrismaClient();

export const getSharedUsers = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        const { contentId } = req.body;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const linkSharedUsers = await prisma.shareLink.findFirst({
            where: {
                contentId: contentId,
                userId: user.id
            },
            select: {
                id: true,
                contentId: true,
                sharedUsers: {
                    select: {
                        id: true,
                        email: true,
                        permission: true
                    }
                }
            }
        });
        if(!linkSharedUsers) {
            return res.status(404).json({
                success: false,
                message: "Users not found with shared link",
            });
        }

        res.status(200).json({
            success: true,
            message: "Shared users fetched successfully",
            data: linkSharedUsers
        });

    }catch(err) {
        console.log("Error in getting shared users", err);
        return res.status(500).json({
            success: false,
            message: "Server error in getting shared users"
        })
    }
}

export const shareLink = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const { permission, email, contentId, description } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        const shareLinkRecord = await getShareLink({
            permission, 
            sharedUserMail: email, 
            contentId, 
            userId: user.id
        });

        const link = `${process.env.FRONTEND_URL}/share/${shareLinkRecord.hash}`;

        await transporter.sendMail({
            from: process.env.HOST_MAIL,
            to: email,
            subject: `${user.name} shared content with you`, 
            text: `You have been invited to view content. Click here: ${link}.${description ? ` Message: ${description}` : ""}`
        });

        res.status(200).json({
            success: true,
            message: "Shared link successfully via mail",
            data: shareLinkRecord
        });

    }catch(err) {
        console.log("Error in sharing link via mail", err);
        return res.status(500).json({
            success: false,
            message: "Server error in sharing link via mail"
        })
    }
}

export const givePermission = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const { permission, email, contentId } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const shareData = await getShareLink({
            permission,
            sharedUserMail: email,
            contentId,
            userId: user.id
        });


        if (shareData.permission !== permission) {
             const updatedUser = await prisma.sharedUser.update({
                where: { id: shareData.sharedUserId },
                data: { permission: permission }
            });
             return res.status(200).json({
                success: true,
                message: "Permission updated successfully",
                data: { ...shareData, permission: updatedUser.permission }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Permission granted successfully",
            data: shareData
        });
    }catch(err) {
        console.log("Error in giving permission", err);
        return res.status(500).json({
            success: false,
            message: "Server error in giving permission"
        })
    }
}

export const removePermission = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const { email, contentId } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const link = await prisma.shareLink.findFirst({
            where: {
                contentId,
                userId: user.id
            }
        });

        if (!link) {
            return res.status(404).json({
                success: false,
                message: "Permission link not found"
            });
        }

        const sharedUser = await prisma.sharedUser.findUnique({
            where: {
                email_shareId: {
                    email: email,
                    shareId: link.id
                }
            }
        });

        if (!sharedUser) {
            return res.status(400).json({
                success: false,
                message: "User does not have this permission",
            });
        }

        await prisma.sharedUser.delete({
            where: { id: sharedUser.id }
        });

        return res.status(200).json({
            success: true,
            message: "Permission removed successfully"
        });

    }catch(err) {
        console.log("Error in removing permission", err);
        return res.status(500).json({
            success: false,
            message: "Server error in removing permission"
        })
    }
}