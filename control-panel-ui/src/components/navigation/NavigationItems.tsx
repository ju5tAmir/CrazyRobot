import { NavigationItemProps } from "../../models/navigation/NavigationItemProps";
import {NavLink} from "react-router-dom";

export default function NavigationItems({ to, icon, text, onClick }: NavigationItemProps) {
    return (
        <li>
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex gap-2 items-center px-4 py-3 rounded-lg ${
                        isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                    }`
                }
                onClick={onClick}
            >
                {icon}
                <span>{text}</span>
            </NavLink>
        </li>
    );
}