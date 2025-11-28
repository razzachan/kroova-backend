"use client";

import React from "react";

export function DefaultCardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full">
      {children}
    </div>
  );
}
