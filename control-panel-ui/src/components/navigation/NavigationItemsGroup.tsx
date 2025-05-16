import {NavigationItemsGroupProps} from "../../models/navigation/NavigationItemsGroupProps.ts";
import NavigationItems from "./NavigationItems.tsx";


export default function NavigationItemsGroup({ items, onItemClick }: NavigationItemsGroupProps) {
    return (
        <>
            {items.map((item) => (
                <NavigationItems
                    key={item.path}
                    to={item.path}
                    icon={item.icon}
                    text={item.text}
                    onClick={onItemClick}
                />
            ))}
        </>
    );
}