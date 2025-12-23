import { addTask, deleteTask, getAllTasks, getTask, updateTask } from "@/controllers/tasks.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const taskRouter = Router();

taskRouter.get('/', isUserLoggedIn, getAllTasks);
taskRouter.get('/:id', isUserLoggedIn, getTask);
taskRouter.post('/', isUserLoggedIn, addTask);
taskRouter.put('/:id', isUserLoggedIn, updateTask);
taskRouter.delete('/:id', isUserLoggedIn, deleteTask);


export default taskRouter;