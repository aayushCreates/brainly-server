import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile got successfully",
      data: user,
    });
  } catch (err) {
    console.log("Error in the get user profile controller");
    return res.status(500).json({
      success: false,
      message: "Server Error in getting user profile, please try again",
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { name, phone, email } = req.body;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.update({
        where: {
            email: user?.email as string
        },
        data: {
            name: name ? name : user?.name,
            email: email ? email : user?.email,
            phone: phone ? phone : user?.phone
        }
    })

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (err) {
    console.log("Error in the update user profile controller");
    return res.status(500).json({
      success: false,
      message: "Server Error in updating user profile, please try again",
    });
  }
};
