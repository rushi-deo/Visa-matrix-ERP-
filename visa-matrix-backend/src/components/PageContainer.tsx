import { ReactNode } from "react";

export default function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 40,
        maxWidth: 500,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
