"use client";
import Image from "next/image";
import React from "react";

const AIWorkspace = () => {
  return <div className="h-screen w-full bg-background">
    <Image src="/kaya.svg" alt="AI" width={50} height={50} />
    <h2 className="text-2xl font-semibold font-pop">Kaya</h2>
  </div>;
};

export default AIWorkspace;
