import { Request, Response } from "express";
import { db } from "../confi/firebase";

export const createApplication = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const docRef = await db.collection("applications").add({
      ...data,
      createdAt: new Date(),
      status: "pending",
    });

    return res.status(201).json({
      message: "Application created successfully",
      applicationId: docRef.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
