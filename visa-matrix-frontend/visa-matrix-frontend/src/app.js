import express from "express";
import cors from "cors";
import countriesRoutes from "./routes/countries.routes.js";
import visaTypesRoutes from "../routes/visaTypesRoutes.js";
import applicationsRoutes from "../routes/applicationsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/countries", countriesRoutes);
app.use("/api", visaTypesRoutes);
app.use("/api", applicationsRoutes);

export default app;
