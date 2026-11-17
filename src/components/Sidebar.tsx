"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle,
  Factory,
  FileText,
  Home,
  Package,
  Settings,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getActiveNavigationHref,
  getVisibleNavigationSections,
  type NavigationIcon,
} from "@/lib/navigation";
import { useSession } from "@/lib/session";
import { BrandLogo } from "@/components/BrandLogo";

const icons: Record<NavigationIcon, LucideIcon> = {
  home: Home,
  fileText: FileText,
  truck: Truck,
  factory: Factory,
  checkCircle: CheckCircle,
  settings: Settings,
  users: Users,
  badgeCheck: BadgeCheck,
  package: Package,
};

type SidebarProps = {
  mobileOpen: boolean;
  onNavigate: () => void;
};

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { permissions } = useSession();
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const sections = getVisibleNavigationSections(permissions);
  const hrefs = sections.flatMap((section) => section.links.map((link) => link.href));
  const activeHref = getActiveNavigationHref(pathname, hrefs);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onNavigate}
          aria-label="Cerrar navegación"
        />
      ) : null}
      <aside
        id="erp-sidebar"
        aria-hidden={isMobileViewport && !mobileOpen}
        inert={isMobileViewport && !mobileOpen}
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-60 shrink-0 flex-col border-r border-surface-border bg-surface text-surface-foreground transition-transform md:sticky md:top-0 md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-surface-border px-5 py-5">
          <BrandLogo />
        </div>

        <nav aria-label="Navegación principal" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
          {sections.map(({ title, links }) => (
            <section key={title} aria-label={title}>
              {title !== "Principal" ? <h2 className="px-3 pb-1.5 text-xs font-medium text-surface-subtle">
                {title}
              </h2> : null}
              <div className="flex flex-col gap-1">
                {links.map(({ href, label, icon }) => {
                  const Icon = icons[icon];
                  const active = activeHref === href;

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-secondary-light text-secondary ring-1 ring-inset ring-secondary/15"
                          : "text-surface-subtle hover:bg-background hover:text-surface-foreground"
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}
