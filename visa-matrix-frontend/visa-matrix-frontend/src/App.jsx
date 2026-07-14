import React from "react";

import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./loveable/router";

import "./index.css";
import "./loveable/styles.fixed.css";

export default function App() {
  const [router] = React.useState(() => getRouter());

  return <RouterProvider router={router} />;
}