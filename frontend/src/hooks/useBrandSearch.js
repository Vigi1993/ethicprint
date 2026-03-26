// src/hooks/useBrandSearch.js
import { useEffect, useState } from "react";

export function useBrandSearch(query, db) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();

    setResults(
      db.filter((brand) => {
        const name = (brand.name || "").toLowerCase();
        const sector = (brand.sector || "").toLowerCase();
        return name.includes(q) || sector.includes(q);
      })
    );
  }, [query, db]);

  return results;
}
