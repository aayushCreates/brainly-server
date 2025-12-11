import { Request, Response, NextFunction } from "express";
import { getJWT, getPasswordHash, validatePassword } from "../utils/auth.utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cookieOptions = {
    httpOnly: true,
    secure: true
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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
        password: hashedPassword,
      },
    });

    const jwt = getJWT(newUser?.id as string, newUser?.email as string);

    res.cookie("token", jwt, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User registered successfully"
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
        res.status(400).json({
          success: true,
          message: "Invalid Creadentials",
        });
      }

    const isValidPassword = validatePassword(
      password,
      user?.password as string
    );

    if (!isValidPassword) {
      res.status(400).json({
        success: true,
        message: "Invalid Creadentials",
      });
    }

    const jwt = getJWT(user?.id as string, user?.email as string);

    res.cookie("token", jwt, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User registered successfully",
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
        res.clearCookie("token", cookieOptions);

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
