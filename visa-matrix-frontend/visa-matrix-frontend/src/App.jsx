import React from "react";

import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./loveable/router";

import "./index.css";
import "./loveable/styles.css";

const router = getRouter();

export default function App() {
  return <RouterProvider router={router} />;
}