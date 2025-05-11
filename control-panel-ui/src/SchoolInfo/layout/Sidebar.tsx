import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, ClipboardList, ChartBar , FileText } from 'lucide-react';
import ThemeToggle from '../ThemeToggle.tsx';
import { useAuth } from '../auth/AuthContext';
import { JSX } from 'react';

type SidebarProps = {
    isOpen: boolean;
    closeSidebar: () => void;
};

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { jwt, logout } = useAuth();

    const isAdmin = pathname.startsWith('/school-info/admin');
    const base = isAdmin ? '/school-info/admin' : '/school-info';

    const item = (to: string, icon: JSX.Element, text: string) => (
        <li key={to}>
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex gap-2 items-center px-4 py-3 rounded-lg ${
                        isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                    }`
                }
                onClick={closeSidebar}
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
        closeSidebar();
    };

    return (
        <>
            {/* overlay для мобільних */}
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
                    <span>SchoolPortal</span>
                </div>

                {/* Menu */}
                <ul className="menu p-2 space-y-1 overflow-auto flex-grow">
                    <li>
                        <button
                            className="flex gap-2 items-center px-4 py-3 rounded-lg hover:bg-base-300 w-full text-left"
                            onClick={() => {
                                closeSidebar();
                                // TODO: nav('/')
                            }}
                        >
                            <Home size={18} />
                            <span>Home</span>
                        </button>
                    </li>

                    <li>
                        <NavLink
                            to="/RobotMovement"
                            className={({ isActive }) =>
                                `flex gap-2 items-center px-4 py-3 rounded-lg ${
                                    isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                                }`
                            }
                            onClick={closeSidebar}
                        >
                            <Users size={18} />
                            <span>Movement</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/tic-tac-toe"
                            className={({ isActive }) =>
                                `flex gap-2 items-center px-4 py-3 rounded-lg ${
                                    isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                                }`
                            }
                            onClick={closeSidebar}
                        >
                            <Calendar size={18} />
                            <span>Tic-Tac-Toe</span>
                        </NavLink>
                    </li>

                    <li><hr /></li>

                    {/* Contacts / Events */}
                    {item(`${base}/contacts`, <Users size={18} />, 'Contacts')}
                    {item(`${base}/events`, <Calendar size={18} />, 'Events')}

                    {/* Surveys / Surveys Results */}
                    {item(`${base}/surveys`, <ClipboardList size={18} />, 'Surveys')}
                    {item(`${base}/survey-results`,   <ChartBar size={18} />, 'Survey Results')}
                    {isAdmin && item(
                        `${base}/ai-reports`,

                        <FileText size={18}/>,
                        'AI Reports'
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
