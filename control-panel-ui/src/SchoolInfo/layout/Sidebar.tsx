// src/SchoolInfo/layout/Sidebar.tsx
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, LogOut }    from 'lucide-react';
import ThemeToggle                           from '../ThemeToggle.tsx';
import { useAuth }                           from '../auth/AuthContext';
import {JSX} from "react";

export default function Sidebar() {
    const { pathname } = useLocation();
    const navigate     = useNavigate();
    const { jwt, logout } = useAuth();

    const isAdmin = pathname.startsWith('/school-info/admin');
    const base    = isAdmin ? '/school-info/admin' : '/school-info';

    const item = (to: string, icon: JSX.Element, text: string) => (
        <li key={to}>
            <NavLink
                to={to}
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

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
        setTimeout(() => navigate('/school-info/contacts', { replace: true }), 0);
    };
    return (
        <aside className="w-56 bg-base-100 border-r relative flex flex-col">
            {/* header з ThemeToggle */}
            <div className="h-16 flex items-center justify-center text-xl font-bold relative">
                <div className="absolute left-2">
                    <ThemeToggle />
                </div>
                <span>SchoolPortal</span>
            </div>

            <ul className="menu p-2 space-y-1">
                {/* Заглушка Home */}
                <li>
                    <button
                        className="flex gap-2 items-center px-4 py-3 rounded-lg hover:bg-base-300 w-full text-left"
                        onClick={() => {/* TODO: nav('/')*/}}
                    >
                        <Home size={18} />
                        <span>Home</span>
                    </button>
                </li>

                {/* Movement */}
                <li>
                    <NavLink
                        to="/RobotMovement"
                        className={({ isActive }) =>
                            `flex gap-2 items-center px-4 py-3 rounded-lg ${
                                isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                            }`
                        }
                    >
                        <Users size={18} />
                        <span>Movement</span>
                    </NavLink>
                </li>

                {/* Tic-Tac-Toe */}
                <li>
                    <NavLink
                        to="/tic-tac-toe"
                        className={({ isActive }) =>
                            `flex gap-2 items-center px-4 py-3 rounded-lg ${
                                isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                            }`
                        }
                    >
                        <Calendar size={18} />
                        <span>Tic-Tac-Toe</span>
                    </NavLink>
                </li>

                <li><hr /></li>

                {/* Contacts / Events */}
                {item(`${base}/contacts`, <Users size={18} />, 'Contacts')}
                {item(`${base}/events`,   <Calendar size={18} />, 'Events')}
            </ul>

            {/* Logout для будь-якого авторизованого */}
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
    );
}
