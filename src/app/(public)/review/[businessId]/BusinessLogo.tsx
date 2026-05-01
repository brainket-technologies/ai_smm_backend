"use client";

import React, { useState } from 'react';
import Image from "next/image";

interface BusinessLogoProps {
  src: string | null | undefined;
  name: string;
}

export default function BusinessLogo({ src, name }: BusinessLogoProps) {
  const [error, setError] = useState(false);

  // Debug log to see what URL is being passed
  console.log(`[BusinessLogo] Loading image: ${src || 'null'}`);

  // If no source or image fails to load, show placeholder with initials
  if (!src || error) {
    return (
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800 shadow-sm">
         <span className="text-2xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
           {name.substring(0, 2)}
         </span>
      </div>
    );
  }

  return (
    <div className="h-20 w-20 rounded-2xl overflow-hidden mb-4 border-2 border-white dark:border-slate-800 shadow-lg relative bg-white dark:bg-slate-800">
      <img 
        src={src} 
        alt={name} 
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => {
          console.error(`[BusinessLogo] Failed to load image: ${src}`);
          setError(true);
        }}
      />
    </div>
  );
}
