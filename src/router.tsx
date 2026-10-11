import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PageSkeleton } from "./components/PageSkeleton";

export const getRouter = () => {
  // Without a staleTime every mount and tab refocus refetched every query.
  // Mutations invalidate what they change, so 30s of reuse is safe.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultViewTransition: true,
    defaultPendingComponent: PageSkeleton,
  });

  return router;
};
