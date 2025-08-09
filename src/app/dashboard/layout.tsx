

'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Boxes,
  LayoutDashboard,
  Users,
  BarChart3,
  BrainCircuit,
  Settings,
  LogOut,
  ChevronDown,
  ScrollText,
  History
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataProvider, useDataContext } from '@/context/data-context';
import { User } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const pathname = usePathname();
  const router = useRouter();
  const { storeInfo, users } = useDataContext();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const { state: sidebarState } = useSidebar();


   React.useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('username');
    if (!role || !name) {
      router.push('/');
    } else {
        const user = users.find(u => u.username === name);
        setCurrentUser(user || null);
    }
  }, [router, users]);

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/inventory', label: t('nav.inventory'), icon: Boxes },
    { href: '/dashboard/customers', label: t('nav.customers'), icon: Users },
    { href: '/dashboard/receipts', label: t('nav.receipts'), icon: ScrollText },
    { href: '/dashboard/reports', label: t('nav.reports'), icon: BarChart3 },
    { href: '/dashboard/stock-alerts', label: t('nav.aiStockAlerts'), icon: BrainCircuit },
  ];

  const supervisorNavItems = [
     { href: '/dashboard/activity-history', label: t('nav.activityHistory'), icon: History },
  ];

  const bottomNavItems = [
      { href: '/dashboard/settings', label: t('nav.settings'), icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    router.push('/');
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                {storeInfo.logo ? (
                    <Image src={storeInfo.logo} alt="Store Logo" width={24} height={24} />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Boxes className="h-5 w-5 text-primary-foreground" />
                    </div>
                )}
                </div>
                {sidebarState === 'expanded' && <span className="font-bold text-lg">{storeInfo.name}</span>}
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             {currentUser.role === 'supervisor' && (
                <>
                    {supervisorNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                            <SidebarMenuButton
                                isActive={pathname === item.href}
                                tooltip={item.label}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
         <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="flex items-center justify-between p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} data-ai-hint="anonymous person" />
                    <AvatarFallback>{currentUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {sidebarState === 'expanded' && <span className="truncate text-sm font-medium">{currentUser.username}</span>}
                  {sidebarState === 'expanded' && <ChevronDown className="ml-auto h-4 w-4 shrink-0" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end">
                <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {sidebarState === 'expanded' && <ThemeToggle />}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <SidebarProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </SidebarProvider>
    </DataProvider>
  )
}
