// src/SchoolInfo/layout/Header.tsx
import { useLocation, useNavigate } from 'react-router-dom';


export default function Header() {
    const { pathname } = useLocation();
    const nav = useNavigate();

    const title = pathname.includes('events')
        ? 'School Events'
        : pathname.includes('admin')
            ? 'Admin Panel'
            : 'School Contacts';

    return (
        <header className="h-16 px-6 flex items-center justify-between bg-base-100 border-b">
            <div className="text-2xl font-semibold">{title}</div>
            <button
                className="btn btn-outline btn-sm flex items-center"
                onClick={() => nav('/school-info/admin/login')}
            >
                <span className="mr-1">Login</span>
                <i className="icon-[lucide--log-in] w-4 h-4" />
            </button>

        </header>
    );
}
