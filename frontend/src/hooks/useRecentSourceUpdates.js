import { useEffect, useState } from "react";
import { getRecentSourceUpdates } from "../api/sources";

export function useRecentSourceUpdates() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    let isMounted = true;

    getRecentSourceUpdates(20).then((data) => {
      if (isMounted) setUpdates(data);
    });

    return () => { isMounted = false; };
  }, []);

  return updates;
}
