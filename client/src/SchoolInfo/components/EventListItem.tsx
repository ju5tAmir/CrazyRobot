
import dayjs from 'dayjs';
import { EventDto } from '../../api/generated-client';

export default function EventListItem({ event }: { event: EventDto }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-2 p-3 rounded-lg hover:bg-base-200">
            <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm opacity-70">{event.description}</div>
            </div>
            <div className="text-sm opacity-80 md:w-56">
                {dayjs(event.date).format('DD MMM YYYY')} &middot; {event.time}
            </div>
            <div className="badge badge-outline">{event.location}</div>
        </div>
    );
}
