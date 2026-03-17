import { useEffect, useState } from "react";
import { getPublicSourcesCount } from "../api/sources";

export function useSourcesCount() {
  const [sourcesCount, setSourcesCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadSourcesCount() {
      const count = await getPublicSourcesCount();

      if (isMounted) {
        setSourcesCount(count);
      }
    }

    loadSourcesCount();

    return () => {
      isMounted = false;
    };
  }, []);

  return sourcesCount;
}
