
import dayjs from 'dayjs';
import { EventDto } from '../../api/generated-client';

enum EventStatus { Upcoming=0, Ongoing=1, Past=2 }

export default function EventCard({ event }: { event: EventDto }) {
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 gap-2">
                <h2 className="card-title text-base">{event.title}</h2>
                <p className="text-sm opacity-80">{event.description}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                    <div className="badge badge-outline">
                        {dayjs(event.date).format('DD MMM YYYY')} &middot; {event.time}
                    </div>
                    <div className="badge badge-outline">{event.location}</div>
                    <div className="badge badge-outline">{event.category}</div>
                </div>
                <div className="text-right">
          <span className={`badge ${
// @ts-expect-error lksjdf
              event.status===0 ? 'badge-primary' :
// @ts-expect-error lksjdf
                  event.status===1 ? 'badge-warning' :
                      'badge-outline'
          }`}>
            {/* @ts-expect-error lskjdf */}
            {EventStatus[event.status!]}
          </span>
                </div>
            </div>
        </div>
    );
}
