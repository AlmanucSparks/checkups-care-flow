
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getPersonName = (person: { name: string } | { name: string }[] | null | undefined) => {
  if (Array.isArray(person)) {
    return person.length > 0 ? person[0].name : "N/A";
  }
  return person?.name || "N/A";
};
