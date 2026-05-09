
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import {
    LayoutDashboard,
    Receipt,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    ChevronRight,
    FileText,
    Sun,
    Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/dashboard/login');
    };

    const navItems = [
        { title: 'Vue d\'ensemble', icon: LayoutDashboard, href: '/dashboard' },
        { title: 'Transactions', icon: Receipt, href: '/dashboard/transactions' },
        { title: 'Logs', icon: FileText, href: '/dashboard/logs' },
        { title: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-all duration-300 transform lg:relative lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <img 
                          src="/logo-alimobile.png" 
                          alt="AliMobile Logo" 
                          className="w-10 h-10 object-contain"
                        />
                        <span className="font-bold text-xl tracking-tight text-foreground">AliMobile</span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === '/dashboard'}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                                    isActive
                                        ? "bg-red-600/10 text-red-500"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.title}
                                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-6 border-t border-border">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                            <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate text-foreground">
                                {user?.name || user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate text-start">Administrateur</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Déconnexion
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
                    <button
                        className="p-2 lg:hidden text-muted-foreground hover:text-foreground"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-10 bg-background transition-colors duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
