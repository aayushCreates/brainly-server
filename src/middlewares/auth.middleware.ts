import { Request, Response, NextFunction } from "express";
import { validateToken } from "../utils/auth.utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const isUserLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const token = req.cookies.token;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token, please login",
      });
    }

    const validToken = await validateToken(token);
    if (!validToken) {
      return res.status(401).json({
        success: false,
        message: "Session Expired, please login",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: validToken.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
