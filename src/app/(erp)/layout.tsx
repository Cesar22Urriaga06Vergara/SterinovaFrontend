"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { canAccessPath, getRoleHomePath } from "@/lib/navigation";
import { useStoredUser } from "@/lib/stored-user-hook";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAccessTokenSnapshot() {
  return localStorage.getItem("access_token") !== null;
}

function getServerAccessTokenSnapshot() {
  return false;
}

export default function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutLoading />}>
      <AuthorizedErpLayout>{children}</AuthorizedErpLayout>
    </Suspense>
  );
}

function AuthorizedErpLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStoredUser();
  const [hydrated, setHydrated] = useState(false);
  const hasAccessToken = useSyncExternalStore(
    subscribeToStorage,
    getAccessTokenSnapshot,
    getServerAccessTokenSnapshot,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasAccessToken || !user) {
      router.replace("/login");
      return;
    }
    if (!canAccessPath(pathname, user.rol)) {
      router.replace(getRoleHomePath(user.rol));
    }
  }, [hasAccessToken, hydrated, pathname, router, user]);

  const canRenderRoute = user ? canAccessPath(pathname, user.rol) : false;
  if (!hydrated || !hasAccessToken || !user || !canRenderRoute) {
    return (
      <LayoutLoading />
    );
  }

  return (
    <div className="flex min-h-screen bg-sterinova-light">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-sterinova-dark/5 bg-white px-4 py-2 md:hidden">
          <button
            type="button"
            aria-controls="erp-sidebar"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sterinova-dark hover:bg-sterinova-light"
          >
            <Menu className="h-5 w-5" aria-hidden />
            Menú
          </button>
        </div>
        <Header />
        <main className="flex-1 overflow-auto bg-sterinova-light p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function LayoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sterinova-light text-sterinova-teal">
      Cargando...
    </div>
  );
}
