
import { useLocation, Link } from 'react-router-dom';

export default function Header() {
    const { pathname } = useLocation();
    const title = pathname.includes('events') ? 'School Events' : 'School Contacts';

    return (
        <header className="h-16 px-6 flex items-center justify-between bg-base-100 border-b">
            <div className="text-2xl font-semibold">{title}</div>
            <Link to="/login" className="btn btn-outline btn-sm">
                <span className="mr-1">Login</span>
                <i className="icon-[lucide--log-in] w-4 h-4" />
            </Link>
        </header>
    );
}
