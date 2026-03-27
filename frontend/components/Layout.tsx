import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Users, 
  Dog, 
  Calendar, 
  Stethoscope, 
  Package, 
  DollarSign, 
  Megaphone, 
  CalendarDays, 
  ShieldAlert,
  Search,
  Bell,
  Settings,
  Plus,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LayoutProps {
  children: React.ReactNode;
}

import GlobalSearch from './GlobalSearch';
import LogoGeneratorDialog from './LogoGeneratorDialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/agendamentos', icon: Calendar, label: 'Agendamentos' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/animais', icon: Dog, label: 'Pacientes' },
    { to: '/veterinario', icon: Stethoscope, label: 'Clínica' },
    { to: '/produtos', icon: Package, label: 'Produtos' },
    { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
    { to: '/marketing', icon: Megaphone, label: 'Marketing' },
    { to: '/escala', icon: CalendarDays, label: 'Escala' },
    { to: '/admin', icon: ShieldAlert, label: 'Usuários' },
  ];

  const isLoginPage = router.pathname === '/login';

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-30",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Stethoscope className="w-8 h-8 text-blue-400 shrink-0" />
          {isSidebarOpen && (
            <span className="ml-3 text-xl font-bold text-white tracking-tight">VetERP<span className="text-blue-400">Pro</span></span>
          )}
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = router.pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
                title={!isSidebarOpen ? item.label : ""}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
                {isSidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-4">
          {isSidebarOpen && (
            <div className="px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status do Sistema</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Todos os serviços operacionais</p>
            </div>
          )}
          
          <button 
            onClick={logout}
            className={cn(
              "flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center flex-1 gap-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-slate-500">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <LogoGeneratorDialog />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm" className="rounded-full border-blue-100 text-blue-600 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-1" /> Novo
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100">
                  <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest p-3">Ações Rápidas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/agendamentos')} className="p-3 cursor-pointer">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Agendamento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/animais')} className="p-3 cursor-pointer">
                    <Dog className="w-4 h-4 mr-2 text-indigo-500" /> Paciente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/clientes?new=true')} className="p-3 cursor-pointer">
                    <Users className="w-4 h-4 mr-2 text-emerald-500" /> Cliente
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/financeiro')} className="p-3 cursor-pointer">
                    <DollarSign className="w-4 h-4 mr-2 text-amber-500" /> Lançamento Financeiro
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button variant="ghost" size="icon" className="text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Settings className="w-5 h-5" />
            </Button>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-slate-500 mt-1">Veterinário</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                {user?.name?.[0] || 'V'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
