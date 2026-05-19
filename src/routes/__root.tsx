import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { StoreProvider } from "@/lib/spf-store";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SPF-OMS — Swan Paper Fabrics Operations" },
      { name: "description", content: "Operations Management System for Swan Paper Fabrics — production, inventory, sales, deliveries, quality." },
      { property: "og:title", content: "SPF-OMS — Swan Paper Fabrics Operations" },
      { name: "twitter:title", content: "SPF-OMS — Swan Paper Fabrics Operations" },
      { property: "og:description", content: "Operations Management System for Swan Paper Fabrics — production, inventory, sales, deliveries, quality." },
      { name: "twitter:description", content: "Operations Management System for Swan Paper Fabrics — production, inventory, sales, deliveries, quality." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/af565771-8786-41a3-9680-396865f79ec2" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/af565771-8786-41a3-9680-396865f79ec2" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="sticky top-0 z-10 h-14 flex items-center gap-3 border-b bg-card px-4">
                <SidebarTrigger />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Operations Management System</span>
                  <span className="text-xs text-muted-foreground">Swan Paper Fabrics</span>
                </div>
                <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
                  Logged in as <span className="font-medium text-foreground">Owner / Manager</span>
                </div>
              </header>
              <main className="flex-1 p-6 overflow-x-auto">
                <Outlet />
              </main>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </SidebarProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
