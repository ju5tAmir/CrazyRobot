import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { adminNavItems, userNavItems } from '../../components/navigation/NavigationPathConfig';

interface HeaderProps {
    openSidebar: () => void;
}

export default function Header({ openSidebar }: HeaderProps) {
    const { pathname } = useLocation();

    const isAdmin = pathname.startsWith('/admin');
    const navItems = isAdmin ? adminNavItems : userNavItems;

    // Find the current page in navigation items
    const currentPage = navItems.find(item =>
        pathname === item.path || pathname.startsWith(`${item.path}/`)
    );

    let title = currentPage?.text;

    if (!title) {
        if (isAdmin) {
            title = 'Admin Panel';
        } else if (pathname.includes('/school-info')) {
            title = 'School Portal';
        }
    }

    return (
        <header className="h-16 px-6 flex items-center justify-between bg-base-100 border-b sticky top-0 z-40">
            <button
                className="md:hidden btn btn-square btn-ghost"
                onClick={openSidebar}
            >
                <Menu size={24} />
            </button>

            <div className="text-2xl font-semibold flex-1 text-center md:text-left md:ml-0 ml-8">
                {title}
            </div>
        </header>
    );
}
