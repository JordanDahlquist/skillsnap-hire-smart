
import { useState } from "react";

export const useJobSorting = () => {
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  return {
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  };
};
