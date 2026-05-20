import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import applicationRoutes from "./routes/application";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/application", applicationRoutes);

export const api = functions.https.onRequest(app);
