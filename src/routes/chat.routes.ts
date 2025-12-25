import { createConversations, deleteConversation, getAllConversationMessages, getAllConversations, getConversation, saveConversationMessage } from "@/controllers/chat.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const chatRouter = Router();

chatRouter.get('/', isUserLoggedIn, getAllConversations);
chatRouter.get('/:id', isUserLoggedIn, getConversation);
chatRouter.post('/', isUserLoggedIn, createConversations);
chatRouter.delete('/:id', isUserLoggedIn, deleteConversation);

chatRouter.post('/:id/message', isUserLoggedIn, saveConversationMessage);
chatRouter.get('/:id/message', isUserLoggedIn, getAllConversationMessages);


export default chatRouter;