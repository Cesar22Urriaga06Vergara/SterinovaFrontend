"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Briefcase,
  CheckCircle,
  Factory,
  FileText,
  Home,
  Settings,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getActiveNavigationHref,
  navigationSections,
  type AppRole,
  type NavigationIcon,
} from "@/lib/navigation";
import { useStoredUser } from "@/lib/stored-user-hook";

const icons: Record<NavigationIcon, LucideIcon> = {
  home: Home,
  briefcase: Briefcase,
  fileText: FileText,
  truck: Truck,
  factory: Factory,
  checkCircle: CheckCircle,
  settings: Settings,
  users: Users,
  badgeCheck: BadgeCheck,
};

type SidebarProps = {
  mobileOpen: boolean;
  onNavigate: () => void;
};

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const user = useStoredUser();
  const role = user?.rol as AppRole | undefined;
  const sections = navigationSections
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => link.roles.some((allowedRole) => allowedRole === role)),
    }))
    .filter((section) => section.links.length > 0);
  const hrefs = sections.flatMap((section) => section.links.map((link) => link.href));
  const activeHref = getActiveNavigationHref(pathname, hrefs);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onNavigate}
          aria-label="Cerrar navegación"
        />
      ) : null}
      <aside
        id="erp-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-sterinova-dark text-white transition-transform md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-lg font-bold tracking-tight">Sterinova ERP</p>
          <p className="mt-1 text-xs text-sterinova-teal">Sistema Interno</p>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3">
          {sections.map(({ title, links }) => (
            <section key={title} aria-label={title}>
              <h2 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                {title}
              </h2>
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
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-sterinova-teal text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
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
