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
