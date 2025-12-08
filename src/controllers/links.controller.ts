import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

export const getLink = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const contentId = req.params.id as string;
        const user = req.user;
        const { permission, expiredAt } = req.body;

        const token = crypto.randomBytes(32).toString("base64url"); // URL-safe Base64 string




    }catch(err) {
        console.log("Error in getting shareable link", err);
        return res.status(500).json({
            success: false,
            message: "Server error in getting link"
        })
    }
}

export const createLink = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const contentId = req.params.id as string;
        const user = req.user;
        const { permission, expiredAt } = req.body;

        const token = crypto.randomBytes(32).toString("base64url"); // URL-safe Base64 string

        const shareableLink = await prisma.shareLink.create({
            data: {
                hash: token,
                permission: permission ? permission : "VIEW", 
                contentId: contentId,
                expiresAt: expiredAt,
                userId: user?.id
            }
        });

        res.status(200).json({
            success: true,
            message: "Shareable generated successfully",
            data: shareableLink
        })

    }catch(err) {
        console.log("Error in getting shareable link", err);
        return res.status(500).json({
            success: false,
            message: "Server error in getting link"
        })
    }
}

export const updateLink = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        
    }catch(err) {
        console.log("Error in getting shareable link", err);
        return res.status(500).json({
            success: false,
            message: "Server error in getting link"
        })
    }
}

export const deleteLink = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        
    }catch(err) {
        console.log("Error in getting shareable link", err);
        return res.status(500).json({
            success: false,
            message: "Server error in getting link"
        })
    }
}

