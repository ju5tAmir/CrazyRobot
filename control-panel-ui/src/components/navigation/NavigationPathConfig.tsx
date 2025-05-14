import { Users, Calendar, ClipboardList, ChartBar, ClipboardPen, FileText, Bot, Gamepad2 } from 'lucide-react';
import {NavItemTypeConfig} from "../../models/navigation/NavItemTypeConfig.ts";

export const adminNavItems: NavItemTypeConfig[] = [
    { path: '/admin/contacts', icon: <Users size={18} />, text: 'Contacts' },
    { path: '/admin/events', icon: <Calendar size={18} />, text: 'Events' },
    { path: '/admin/surveys', icon: <ClipboardList size={18} />, text: 'Surveys' },
    { path: '/admin/survey-results', icon: <ChartBar size={18} />, text: 'Survey Results' },
    { path: '/admin/ai-reports', icon: <FileText size={18}/>, text: 'AI Reports' },
];

export const userNavItems: NavItemTypeConfig[] = [
    { path: '/school-info/robot-movement', icon: <Bot size={18} />, text: 'Robot Control' },
    { path: '/school-info/tic-tac-toe', icon: <Gamepad2 size={18} />, text: 'Tic-Tac-Toe' },
    { path: '/school-info/contacts', icon: <Users size={18} />, text: 'Contacts' },
    { path: '/school-info/events', icon: <Calendar size={18} />, text: 'Events' },
    { path: '/school-info/surveys-user', icon: <ClipboardPen size={18} />, text: 'Surveys' },
];