import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
      const user = req.user;

      const tasks = await prisma.task.findMany({
        where: {
          userId: user?.id
        }
      });
      if(Array.isArray(tasks) && tasks.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tasks are not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Tasks are found successfully",
        data: tasks
      });

  } catch (err) {
    console.log("Error in the getting all the tasks");
    return res.status(500).json({
      success: false,
      message: "Internal server error in getting all tasks",
    });
  }
};

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    const task = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user?.id
      }
    });
    if(!task) {
      return res.status(404).json({
        success: false,
        message: "Task is not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks is got successfully",
      data: task
    });

  } catch (err) {
    console.log("Error in the getting task");
    return res.status(500).json({
      success: false,
      message: "Internal server error in getting task",
    });
  }
};

export const addTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { title, description, status, dueDate, startDate, startTime, endTime, priority, contentId } = req.body;

    if(!title) {
      return res.status(400).json({
        success: false,
        message: "title not found"
      })
    }

    const newTask = await prisma.task.create({
      data: {
        title: title,
        description: description,
        status: status,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        startTime: (startDate && startTime) ? new Date(`${startDate}T${startTime}`) : (startTime ? new Date(startTime) : null),
        endTime: (dueDate && endTime) ? new Date(`${dueDate}T${endTime}`) : (endTime ? new Date(endTime) : null),
        priority: priority,
        contentId: contentId || null,
        userId: user?.id
      }
    });

    return res.status(200).json({
      success: true,
      message: "Tasks added successfully",
      data: newTask
    });
  } catch (err) {
    console.log("Error in the adding task");
    return res.status(500).json({
      success: false,
      message: "Internal server error in adding task",
    });
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;
    const { title, description, dueDate, startDate, startTime, endTime, priority, status, contentId } = req.body;

    const existedTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user?.id
      }
    });
    if(!existedTask) {
      return res.status(404).json({
        success: true,
        message: "Task is not found"
      });
    }

    const dateBase = dueDate ? dueDate : (existedTask.dueDate ? existedTask.dueDate.toISOString().split("T")[0] : null);

    let finalStartTime = existedTask.startTime;
    if (startTime) {
      // If time string provided, combine with dateBase if available
      finalStartTime = dateBase ? new Date(`${dateBase}T${startTime}`) : new Date(startTime);
    }

    let finalEndTime = existedTask.endTime;
    if (endTime) {
      finalEndTime = dateBase ? new Date(`${dateBase}T${endTime}`) : new Date(endTime);
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: id,
        userId: user?.id
      },
      data: {
        title: title ? title : existedTask?.title,
        description: description ? description : existedTask?.description,
        status : status ? status : existedTask?.status,
        dueDate: dueDate ? new Date(dueDate) : existedTask.dueDate,
        startDate: startDate ? new Date(startDate) : existedTask.startDate,
        startTime: finalStartTime,
        endTime: finalEndTime,
        priority: priority ? priority : existedTask?.priority,
        contentId: contentId ? contentId : existedTask.contentId
      }
    });

    res.status(200).json({
      success: true,
      message: "Task is updated successfully"
    });
  } catch (err) {
    console.log("Error in the updating task", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error in updating task",
    });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    const existedTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user?.id
      }
    });
    if(!existedTask) {
      return res.status(404).json({
        success: true,
        message: "Task is not found"
      });
    }

    const deletedTask = await prisma.task.delete({
      where: {
        id: id
      }
    });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (err) {
    console.log("Error in the deleting task");
    return res.status(500).json({
      success: false,
      message: "Internal server error in deleting task",
    });
  }
};
