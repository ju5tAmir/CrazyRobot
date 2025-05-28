
import { useState } from 'react';

import { EventDto } from '../../../api/generated-client';

interface Props {
    initial?: EventDto;
    onSubmit(dto: EventDto): void;
}

export default function EventForm({ initial, onSubmit }: Props) {


    const [dto, setDto] = useState<EventDto>({
        title: '',
        description: '',
        date: initial?.date ? new Date(initial.date) : new Date(),
        time: initial?.time ?? '',
        location: initial?.location ?? '',
        category: initial?.category ?? '',
        ...initial,
    });

    function bind<K extends keyof EventDto>(key: K) {
        return {
            value: dto[key] as string,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                setDto(prev => ({
                    ...prev,
                    [key]: key === 'date' ? new Date(val) : val,
                }));
            },
        };
    }

    return (
        <div className="flex flex-col gap-3">
            <input {...bind('title')} placeholder="Title" className="input input-bordered" />
            <input {...bind('description')} placeholder="Description" className="input input-bordered" />
            <input {...bind('date')} type="date" className="input input-bordered" />
            <input {...bind('time')} type="time" className="input input-bordered" />
            <input {...bind('location')} placeholder="Location" className="input input-bordered" />
            <input {...bind('category')} placeholder="Category" className="input input-bordered" />
            <button className="btn btn-primary" onClick={() => onSubmit(dto)}>
                {initial?.id ? 'Save' : 'Create'}
            </button>
        </div>
    );
}
