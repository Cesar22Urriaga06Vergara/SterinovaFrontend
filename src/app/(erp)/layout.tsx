"use client";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { canAccessPath, getRoleHomePath } from "@/lib/navigation";
import { SessionProvider, useSession } from "@/lib/session";
import { useStoredUser } from "@/lib/stored-user-hook";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

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

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LayoutLoading />}>
      <SessionProvider>
        <AuthorizedErpLayout>{children}</AuthorizedErpLayout>
      </SessionProvider>
    </Suspense>
  );
}

function AuthorizedErpLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStoredUser();
  const { can, permissions } = useSession();
  const quoteRoute =
    pathname === "/comercial/cotizaciones" ||
    pathname.startsWith("/comercial/cotizaciones/");
  const routeAllowed = quoteRoute
    ? can(
        pathname.endsWith("/nueva") ? "cotizaciones.crear" : "cotizaciones.ver",
      )
    : canAccessPath(pathname, user.rol, permissions);
  const hydrated = useSyncExternalStore(
    subscribeToStorage,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const hasAccessToken = useSyncExternalStore(
    subscribeToStorage,
    getAccessTokenSnapshot,
    getServerAccessTokenSnapshot,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMobileNav() {
    menuButtonRef.current?.focus();
    setMobileNavOpen(false);
  }

  useEffect(() => {
    if (!mobileNavOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      closeMobileNav();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasAccessToken || !user) {
      router.replace("/login");
      return;
    }
    if (!routeAllowed) {
      router.replace(getRoleHomePath(user.rol, permissions));
    }
  }, [hasAccessToken, hydrated, pathname, router, user, permissions, routeAllowed]);

  const canRenderRoute = routeAllowed;
  if (!hydrated || !hasAccessToken || !user || !canRenderRoute) {
    return <LayoutLoading />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-sterinova-light md:flex-row">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-control bg-white px-4 py-2 font-semibold text-sterinova-dark shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Saltar al contenido principal
      </a>
      <div className="w-full border-b border-sterinova-dark/5 bg-white px-4 py-2 md:hidden">
        <button
          ref={menuButtonRef}
          id="erp-menu-toggle"
          type="button"
          aria-controls="erp-sidebar"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sterinova-dark hover:bg-sterinova-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Menu className="h-5 w-5" aria-hidden />
          Menú
        </button>
      </div>
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={closeMobileNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto bg-sterinova-light p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:p-6"
        >
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
