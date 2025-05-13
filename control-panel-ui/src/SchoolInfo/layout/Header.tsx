import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
    openSidebar: () => void;
}

export default function Header({ openSidebar }: HeaderProps) {
    const { pathname } = useLocation();

    const title = pathname.includes('events')
        ? 'School Events'
        : pathname.includes('admin')
            ? 'Admin Panel'
            : 'School Contacts';

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
