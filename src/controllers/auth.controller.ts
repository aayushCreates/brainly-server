import { Request, Response, NextFunction } from "express";
import { getJWT, getPasswordHash, validatePassword } from "../utils/auth.utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
//   sameSite: "lax",
//   maxAge: 7 * 24 * 60 * 60 * 1000,
// };

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter the required fields",
      });
    }

    const hashedPassword = (await getPasswordHash(password)) as string;

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
      },
    });

    const jwt = await getJWT(newUser?.id as string, newUser?.email as string);

    // res.cookie("token", jwt, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser?.id,
        name: name,
        phone: phone,
        email: email,
      },
      token: jwt,
    });
  } catch (err) {
    console.log("Error in the register user controller");
    return res.status(500).json({
      success: false,
      message: "Server Error in registeration of user, please try again",
    });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter the required fields",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isValidPassword = await validatePassword(
      password,
      user?.password as string
    );

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const jwt = await getJWT(user?.id as string, user?.email as string);

    // res.cookie("token", jwt, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: user?.id,
        name: user?.name,
        email: email,
        phone: user?.phone
      },
      token: jwt,
    });
  } catch (err) {
    console.log("Error in the login user controller");
    return res.status(500).json({
      success: false,
      message: "Server Error in loggedin user, please try again",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // res.clearCookie("token", cookieOptions);

    res.status(200).json({
      success: true,
      message: "User loggedout successfully",
    });
  } catch (err) {
    console.log("Error in the logout user controller");
    return res.status(500).json({
      success: false,
      message: "Server Error in loggedout user, please try again",
    });
  }
};

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_failed`
      );
    }

    const isUserExists = await prisma.user.findUnique({
      where: {
        googleId: user?.googleId,
      },
    });

    if (isUserExists) {
      const token = await getJWT(
        isUserExists.id as string,
        isUserExists.email as string
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/home?token=${token}`
      );
    }

    const userEmailExists = await prisma.user.findUnique({
      where: {
        email: user?.email,
      },
    });

    if (userEmailExists) {
      const updatedUser = await prisma.user.update({
        where: {
          email: userEmailExists.email as string,
        },
        data: {
          googleId: user?.googleId,
        },
      });
      const token = await getJWT(
        updatedUser.id as string,
        updatedUser.email as string
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/home?token=${token}`
      );
    }

    const newUser = await prisma.user.create({
      data: {
        googleId: user?.googleId,
        email: user?.email,
        name: user?.name,
      },
    });

    const token = await getJWT(newUser.id as string, newUser.email as string);
    
    return res.redirect(
      `${process.env.FRONTEND_URL}/home?token=${token}`
    );
  } catch (err) {
    console.log("Error in the google login", err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=server_error`
    );
  }
};