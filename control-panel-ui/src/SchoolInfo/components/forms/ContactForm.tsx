
import { useState } from 'react';
import { ContactDto } from '../../../api/generated-client';

interface Props {
    initial?: ContactDto;
    onSubmit(dto: ContactDto): void;
}

export default function ContactForm({ initial, onSubmit }: Props) {
    const [dto, setDto] = useState<ContactDto>(initial ?? {});

    function bind<K extends keyof ContactDto>(key: K) {
        return {
            value: dto[key] ?? '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setDto({ ...dto, [key]: e.target.value }),
        };
    }

    return (
        <div className="flex flex-col gap-3">
            <input {...bind('name')} placeholder="Name" className="input input-bordered" />
            <input {...bind('role')} placeholder="Role" className="input input-bordered" />
            <input {...bind('department')} placeholder="Department" className="input input-bordered" />
            <input {...bind('email')} type="email" placeholder="Email" className="input input-bordered" />
            <input {...bind('phone')} placeholder="Phone" className="input input-bordered" />
            <button className="btn btn-primary" onClick={() => onSubmit(dto)}>
                {initial?.id ? 'Save' : 'Create'}
            </button>
        </div>
    );
}
