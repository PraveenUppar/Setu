'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardCheck,
  FileText,
  ClipboardList,
  ClipboardX,
  Download,
  ListChecks,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { href: '/', label: 'Home', icon: Home },
      { href: '/eligibility', label: 'Eligibility', icon: ClipboardCheck },
      { href: '/intake', label: 'Intake', icon: ClipboardList },
      { href: '/document/gaps', label: 'Gap Report', icon: ClipboardX },
      { href: '/document', label: 'Document', icon: FileText },
      { href: '/export', label: 'Export', icon: Download },
    ],
  },
  {
    label: 'Review',
    items: [
      { href: '/review', label: 'Review', icon: ListChecks },
      { href: '/review/risks', label: 'Risks', icon: AlertTriangle },
      // Audit log deliberately dropped from navigation (not deleted — still
      // a real route at /review/audit, still logging every action). It only
      // pays for itself with more than one real reviewer; for a solo demo
      // it's just watching your own role-switches get recorded.
    ],
  },
];

/**
 * The persistent left navigation, built on shadcn's Sidebar primitive
 * (`components/ui/sidebar.tsx`) rather than plain divs — real collapse-to-
 * icon, a mobile drawer, and a Cmd/Ctrl+B shortcut come from that primitive
 * for free. Active state is exact-path, since Review and Risks are siblings
 * under /review, not a hierarchy.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            S
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Super Finance
          </span>
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </SidebarPrimitive>
  );
}
