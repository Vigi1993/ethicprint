import { createContext, useContext } from "react";

export const CategoriesContext = createContext([]);

export function useCategories() {
  return useContext(CategoriesContext);
}
