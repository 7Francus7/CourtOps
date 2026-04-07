import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
       return twMerge(clsx(inputs))
}

export function safeSerialize<T>(data: T): T {
       return JSON.parse(JSON.stringify(data))
}

export function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://courtops.net';
  return (url || 'https://courtops.net').trim().replace(/\/$/, '');
}
