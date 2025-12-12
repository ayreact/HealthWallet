/**
 * HealthWallet Nigeria - Sidebar Navigation
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  Building2,
  Wallet,
  Settings,
  HelpCircle,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: ('PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN')[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['PATIENT'] },
  { name: 'Medical Records', href: '/records', icon: FileText, roles: ['PATIENT'] },
  { name: 'Family Fund', href: '/family-fund', icon: Users, roles: ['PATIENT'] },
  { name: 'Hospital Portal', href: '/hospital/portal', icon: Building2, roles: ['HOSPITAL', 'DOCTOR', 'ADMIN'] },
  { name: 'Drug Verification', href: '/verify-drug', icon: Shield },
];

const secondaryNavigation: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
      {/* Logo */}
      <a href="/">
        <div className="flex h-16 shrink-0 items-center gap-3">
          <img src="/logo.png" alt="Health Wallet Logo" className="h-9 w-9" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">HealthWallet</span>
            <span className="text-xs text-sidebar-foreground/70">Nigeria</span>
          </div>
        </div>
      </a>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          {/* Main Navigation */}
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-transform group-hover:scale-110',
                          isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'
                        )}
                      />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Secondary Navigation */}
          <li>
            <div className="text-xs font-semibold leading-6 text-sidebar-foreground/50 uppercase tracking-wider">
              Settings
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'
                        )}
                      />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* User Info */}
          <li className="mt-auto">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
              <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-sidebar-primary">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.role}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};
