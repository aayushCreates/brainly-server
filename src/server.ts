import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";

import "./utils/passport.utils";

import authRouter from "./routes/auth.routes";
import contentRouter from "./routes/content.routes";
import shareRouter from "./routes/share.routes";

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3030"]
  })
);

app.use(morgan("dev"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/share", shareRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("server is running on the port " + port + "🚀");
});
