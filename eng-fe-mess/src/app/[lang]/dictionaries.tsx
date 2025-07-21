import "server-only";

const dictionaries = {
  en: () =>
    import("../../localization/en.json").then((module) => module.default),
  //   nl: () => import("../localization/nl.json").then((module) => module.default),
};

export const getDictionary = async (locale: "en") => dictionaries[locale]();
