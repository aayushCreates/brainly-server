import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    console.log("body content: ", req.body);

    const { title, type, url, tags } = req.body;
    if (!title || !type || !url || !tags) {
      return res.status(400).json({
        success: false,
        message: "Enter the required informations",
      });
    }

    const addContent = await prisma.content.create({
      data: {
        title: title,
        type: type,
        url: url,
        tags: tags,
        userId: user?.id as string,
      },
    });
    console.log("add content: ", addContent);

    res.status(200).json({
      success: true,
      message: "Content is added successfully",
      data: addContent,
    });
  } catch (err) {
    console.log("Error in adding content: " + err);
    return res.status(500).json({
      success: false,
      message: "Error in adding content",
    });
  }
};

export const getContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    const content = await prisma.content.findUnique({
      where: {
        id: id,
      },
    });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Content found successfully",
      data: content,
    });
  } catch (err) {
    console.log("Error in getting Content: " + err);
    return res.status(500).json({
      success: false,
      message: "Error in getting Content",
    });
  }
};

export const getAllContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const allContents = await prisma.content.findMany({
      where: {
        userId: user?.id as string,
      },
    });
    if (allContents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Content found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All Content found successfully",
      data: allContents,
    });
  } catch (err) {
    console.log("Error in getting all Contents: " + err);
    return res.status(500).json({
      success: false,
      message: "Error in getting all Contents",
    });
  }
};

export const updateContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { title, type, url } = req.body;
    const id = req.params.id as string;

    const content = await prisma.content.findUnique({
      where: {
        id: id,
      },
    });
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content is not found",
      });
    }

    const updatedData = {
      title: title ? title : content.title,
      type: type ? type : content.type,
      url: url ? url : content.url,
    };

    const updatedContent = await prisma.content.update({
      where: {
        id: id,
      },
      data: updatedData,
    });

    res.status(200).json({
      success: true,
      message: "Content is updated successfully",
    });
  } catch (err) {
    console.log("Error in updating content details: " + err);
    return res.status(500).json({
      success: false,
      message: "Error in updating content details",
    });
  }
};

export const deleteContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    const deletedContent = await prisma.content.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Content is deleted successfully",
    });
  } catch (err) {
    console.log("Error in deleting content details: " + err);
    return res.status(500).json({
      success: false,
      message: "Error in deleting content details",
    });
  }
};

export const getContentBySharedLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const linkHash = req.params.id as string;
    const currDate = new Date();

    const linkData = await prisma.shareLink.findUnique({
      where: {
        hash: linkHash
      },
      include: {
        content: true
      }
    });
    if(!linkData) {
      return res.status(404).json({
        success: false,
        message: "Invalid shared link"
      })
    };

    if(linkData.expiresAt && linkData.expiresAt < currDate) {
      return res.status(410).json({
        success: false,
        message: "Link Expired"
      })
    }

    res.status(200).json({
      success: true,
      message: "Content got successfully",
      data: linkData?.content
    });
  } catch (err) {
    console.log("Error in getting content details by shared link: " + err);
    return res.status(500).json({
      success: false,
      message: "Error in getting content details by shared link",
    });
  }
};