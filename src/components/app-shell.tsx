"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Switch from "@radix-ui/react-switch";
import {
  ArrowsLeftRight,
  Books,
  ChartLineUp,
  ClipboardText,
  Database,
  GlobeHemisphereEast,
  List,
  MagnifyingGlass,
  NotePencil,
  Package,
  PresentationChart,
  ShieldCheck,
  SignOut,
  UserCircle,
  X,
  type Icon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { PresentationProvider, usePresentationMode } from "@/components/presentation-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  presentationSafe?: boolean;
};

const primaryNav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: ChartLineUp,
    presentationSafe: true,
  },
  {
    href: "/countries/SG",
    label: "Explore countries",
    icon: GlobeHemisphereEast,
    presentationSafe: true,
  },
  {
    href: "/compare",
    label: "Compare markets",
    icon: ArrowsLeftRight,
    presentationSafe: true,
  },
  {
    href: "/briefs/new",
    label: "Brief builder",
    icon: NotePencil,
    presentationSafe: true,
  },
  {
    href: "/evidence",
    label: "Evidence library",
    icon: Books,
    presentationSafe: true,
  },
];

const adminNav: NavItem[] = [
  { href: "/admin/review", label: "Review queue", icon: ClipboardText },
  { href: "/admin/sources", label: "Source registry", icon: Database },
  { href: "/admin/trends", label: "Trend manager", icon: ShieldCheck },
  { href: "/admin/products", label: "Cisco catalog", icon: Package },
];

function ProductMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-offset-4"
      aria-label="ASEAN Cyber Signals overview"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold tracking-tight text-white"
        aria-hidden="true"
      >
        AS
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold tracking-tight text-foreground">
            ASEAN Cyber Signals
          </span>
          <span className="block truncate text-xs text-subtle">
            Presales intelligence
          </span>
        </span>
      )}
    </Link>
  );
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  const IconComponent = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-surface-selected text-accent-hover"
          : "text-muted hover:bg-surface-subtle hover:text-foreground",
      )}
    >
      <IconComponent size={20} weight={active ? "duotone" : "regular"} />
      <span>{item.label}</span>
    </Link>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { enabled } = usePresentationMode();
  const visiblePrimary = enabled
    ? primaryNav.filter((item) => item.presentationSafe)
    : primaryNav;

  return (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-7">
      <div className="grid gap-1">
        {visiblePrimary.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>
      {!enabled && (
        <div>
          <p className="mb-2 px-3 text-xs font-semibold text-subtle">Workspace</p>
          <div className="grid gap-1">
            {adminNav.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function Sidebar() {
  const { enabled } = usePresentationMode();
  if (enabled) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r border-line bg-surface px-4 py-4 lg:flex">
      <div className="px-2 pb-7">
        <ProductMark />
      </div>
      <Navigation />
      <div className="mt-6 rounded-lg border border-line bg-surface-subtle p-3">
        <p className="text-xs font-semibold text-foreground">Public-source prototype</p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Validate product capabilities and customer requirements before sharing.
        </p>
      </div>
    </aside>
  );
}

function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation">
          <List size={22} />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#0f172a]/35" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,320px)] flex-col border-r border-line bg-surface p-4 shadow-[var(--shadow-menu)]">
          <div className="mb-7 flex items-center justify-between gap-4">
            <Dialog.Title asChild>
              <ProductMark />
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close navigation">
                <X size={22} />
              </Button>
            </Dialog.Close>
          </div>
          <Navigation onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PresentationControl() {
  const { enabled, setEnabled } = usePresentationMode();
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted hover:bg-surface-subtle">
      <PresentationChart size={20} weight={enabled ? "duotone" : "regular"} />
      <span className="hidden sm:inline">Presentation</span>
      <Switch.Root
        checked={enabled}
        onCheckedChange={setEnabled}
        className="relative h-6 w-11 rounded-full border border-line-strong bg-surface transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent"
        aria-label="Presentation mode"
      >
        <Switch.Thumb className="block size-4 translate-x-1 rounded-full bg-line-strong transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-white" />
      </Switch.Root>
    </label>
  );
}

function AccountMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open account menu">
          <UserCircle size={23} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-lg border border-line bg-surface p-2 shadow-[var(--shadow-menu)]"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-foreground">Owner workspace</p>
            <p className="mt-0.5 text-xs text-subtle">Single-user access</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <form action="/api/auth/logout" method="post">
            <DropdownMenu.Item asChild>
              <button
                type="submit"
                className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium text-danger outline-none hover:bg-danger-soft focus:bg-danger-soft"
              >
                <SignOut size={18} />
                Sign out
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Topbar() {
  const { enabled } = usePresentationMode();
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-line bg-surface/95 px-4",
        !enabled && "lg:left-[248px]",
      )}
    >
      <div className="flex w-full items-center gap-3">
        <div className="lg:hidden">
          <MobileMenu />
        </div>
        {enabled && <ProductMark compact />}
        <form action="/dashboard" className="relative hidden max-w-md flex-1 md:block">
          <MagnifyingGlass
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <label htmlFor="global-search" className="sr-only">
            Search trends and evidence
          </label>
          <input
            id="global-search"
            name="q"
            type="search"
            placeholder="Search trends and evidence"
            className="h-10 w-full rounded-lg border border-line bg-surface-subtle pl-10 pr-3 text-sm text-foreground placeholder:text-subtle hover:border-line-strong focus:border-focus focus:bg-surface focus:outline-none"
          />
        </form>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <p className="hidden text-xs text-subtle xl:block">
            Reviewed 18 Jul 2026
          </p>
          <PresentationControl />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const { enabled } = usePresentationMode();
  return (
    <div data-presentation={enabled ? "true" : "false"}>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar />
      <Topbar />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "min-h-[100dvh] pt-16 transition-[padding]",
          !enabled && "lg:pl-[248px]",
        )}
      >
        {children}
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PresentationProvider>
      <ShellContent>{children}</ShellContent>
    </PresentationProvider>
  );
}
