import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import ThemeToggle from '../ThemeToggle.tsx';
import { useAuth } from '../auth/AuthContext';
import NavigationItemsGroup from '../../components/navigation/NavigationItemsGroup.tsx';
import { adminNavItems, userNavItems } from '../../components/navigation/NavigationPathConfig.tsx';

type SidebarProps = {
    isOpen: boolean;
    closeSidebar: () => void;
};

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { jwt, logout } = useAuth();

    const isAdmin = pathname.startsWith('/admin');
    const base = isAdmin ? '/admin' : '/school-info';
    const title = isAdmin ? 'Admin Panel' : 'School Portal';

    const handleLogout = () => {
        logout();
        navigate(base, { replace: true });
        setTimeout(() => navigate(base, { replace: true }), 0);
        closeSidebar();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-40"
                    onClick={closeSidebar}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } w-64 bg-base-100 border-r transition-transform duration-300 ease-in-out z-50 md:translate-x-0 md:static md:w-56 flex flex-col`}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-center text-xl font-bold relative">
                    <div className="absolute left-2">
                        <ThemeToggle />
                    </div>
                    <span>{title}</span>
                </div>

                {/* Menu */}
                <ul className="menu p-2 space-y-1 overflow-auto flex-grow">
                    {isAdmin ? (
                        <NavigationItemsGroup items={adminNavItems} onItemClick={closeSidebar} />
                    ) : (
                        <NavigationItemsGroup items={userNavItems} onItemClick={closeSidebar} />
                    )}
                </ul>

                {/* Logout */}
                {jwt && (
                    <div className="p-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full justify-center gap-2 items-center btn btn-outline btn-error"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
