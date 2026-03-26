// src/hooks/useInitialData.js
import { useEffect, useState } from "react";
import { getBrands } from "../api/brands";
import { getCategories } from "../api/categories";

export function useInitialData(lang) {
  const [db, setDb] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setLoading(true);

      try {
        const [brandsData, categoriesData] = await Promise.all([
          getBrands(lang),
          getCategories(),
        ]);

        if (!isMounted) return;

        setDb(brandsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error loading initial data:", err);

        if (!isMounted) return;

        setDb([]);
        setCategories([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [lang]);

  return {
    db,
    categories,
    loading,
  };
}
