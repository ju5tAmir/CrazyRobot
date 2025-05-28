import { JSX } from 'react';

export interface NavigationItemProps {
    to: string;
    icon: JSX.Element;
    text: string;
    onClick?: () => void;
}