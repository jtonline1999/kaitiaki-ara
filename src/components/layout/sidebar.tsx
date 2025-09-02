'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { KaitiakiAraLogo } from '@/components/icons';
import { LayoutDashboard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Vehicles', icon: Truck },
];

export function AppSidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("grid items-start gap-2 px-4 text-sm font-medium", isMobile && 'px-2')}>
        {!isMobile && (
             <Link href="/dashboard" className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <KaitiakiAraLogo className="h-8 w-8 text-primary" />
                <span className="font-headline">Kaitiaki Ara</span>
             </Link>
        )}
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              { 'bg-muted text-primary': isActive }
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
    return (
        <div className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b px-6">
                </div>
                <div className="flex-1 py-2">
                    <AppSidebarNav />
                </div>
            </div>
        </div>
    );
}
