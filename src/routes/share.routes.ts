import { Router } from "express";
import {
  shareLink,
  removePermission,
  getSharedUsers,
  givePermission,
} from "../controllers/share.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";

const shareRouter = Router();

shareRouter.get("/:id", isUserLoggedIn, getSharedUsers);
shareRouter.post("/", isUserLoggedIn, shareLink);
shareRouter.put("/edit/:id", isUserLoggedIn, givePermission);
shareRouter.delete("/:id", isUserLoggedIn, removePermission);

export default shareRouter;
