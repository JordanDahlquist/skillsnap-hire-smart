
import { QueryClient } from "@tanstack/react-query";
import { getQueryDefaults } from "./query/queryDefaults";
import { getMutationDefaults } from "./query/mutationDefaults";

export const createOptimizedQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: getQueryDefaults(),
    mutations: getMutationDefaults()
  }
});
