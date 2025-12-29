import { createConversation, deleteConversation, getAllConversationMessages, getAllConversations, getConversation, sendConversationMessage } from "@/controllers/chat.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const chatRouter = Router();

chatRouter.get('/history', isUserLoggedIn, getAllConversations);
chatRouter.get('/:id', isUserLoggedIn, getConversation);
chatRouter.post('/', isUserLoggedIn, createConversation);
chatRouter.delete('/:id', isUserLoggedIn, deleteConversation);

chatRouter.post('/:id/message', isUserLoggedIn, sendConversationMessage);
chatRouter.get('/:id/message', isUserLoggedIn, getAllConversationMessages);


export default chatRouter;
