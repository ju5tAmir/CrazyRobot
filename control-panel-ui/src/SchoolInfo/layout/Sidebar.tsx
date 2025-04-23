// src/SchoolInfo/layout/Sidebar.tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Users, Calendar }      from 'lucide-react';
import {JSX} from "react";

export default function Sidebar() {
    const { pathname } = useLocation();

    const isAdmin = pathname.startsWith('/school-info/admin');

    const base = isAdmin ? '/school-info/admin' : '/school-info';

    const item = (slug: string, icon: JSX.Element, text: string) => (
        <li>
            <NavLink
                to={`${base}/${slug}`}
                className={({ isActive }) =>
                    `flex gap-2 items-center px-4 py-3 rounded-lg ${
                        isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                    }`
                }
            >
                {icon}
                <span>{text}</span>
            </NavLink>
        </li>
    );

    return (
        <aside className="w-56 bg-base-100 border-r">
            <div className="h-16 flex items-center justify-center text-xl font-bold">
                SchoolPortal
            </div>
            <ul className="menu p-2 space-y-1">
                {item('contacts', <Users size={18} />, 'Contacts')}
                {item('events',   <Calendar size={18} />, 'Events')}
            </ul>
        </aside>
    );
}
