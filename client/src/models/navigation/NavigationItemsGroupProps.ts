import {NavItemTypeConfig} from "./NavItemTypeConfig.ts";

export interface NavigationItemsGroupProps {
    items: NavItemTypeConfig[];
    onItemClick?: () => void;
}