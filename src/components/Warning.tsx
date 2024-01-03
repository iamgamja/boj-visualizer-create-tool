import React from "react";

export default function Warning({ children }: { children: React.ReactNode }) {
  return <p className="p-2 rounded bg-orange-300">⚠️ {children}</p>;
}
