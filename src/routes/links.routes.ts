import { Router } from "express";
import {
  createLink,
  deleteLink,
  getLink,
  updateLink,
} from "../controllers/links.controller";

const linkRouter = Router();

linkRouter.get("/:id", getLink);
linkRouter.post("/", createLink);
linkRouter.put("/edit/:id", updateLink);
linkRouter.delete("/:id", deleteLink);

export default linkRouter;
