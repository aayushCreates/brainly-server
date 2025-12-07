import { Router } from "express";
import { isUserLoggedIn } from "../middlewares/auth.middleware";
import { addContent, deleteContent, getAllContent, getContent, updateContent } from "../controllers/content.controller";

const contentRouter = Router();

contentRouter.get('/', isUserLoggedIn, getAllContent);
contentRouter.get('/:id', isUserLoggedIn, getContent);
contentRouter.post('/', isUserLoggedIn, addContent);
contentRouter.put('/:id', isUserLoggedIn, updateContent);
contentRouter.delete('/:id', isUserLoggedIn, deleteContent);


export default contentRouter;