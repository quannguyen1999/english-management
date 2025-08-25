import { DEFAULT_PAGE } from "@/constants";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const useMeetingsFilters = () => {
  return useQueryStates({
    username: parseAsString,
    page: parseAsInteger,
  });
};
