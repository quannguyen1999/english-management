import { ErrorResponse } from "./types/error-reponse";

export const getRandomName = () => {
  const names = ["John", "Jane", "Jim", "Jill", "Jack", "Jill", "Jim", "Jane"];
  return names[Math.floor(Math.random() * names.length)];
};

export const splitWords = (text: string, maxWords: number) => {
  if (text.length > maxWords) {
    return text.split(" ").slice(0, maxWords).join(" ").concat("...");
  }
  return text;
};

export const formatLowerString = (text: string) => {
  return text.toLowerCase();
};

export const extractDetailBadRequest = (error: ErrorResponse) => {
  return error && error.details && error.details.length > 0
    ? error.details[0].toLowerCase()
    : error.message.toLowerCase();
};
