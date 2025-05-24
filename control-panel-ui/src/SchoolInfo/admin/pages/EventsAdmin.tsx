
import { useState, useEffect } from 'react';
import { EventDto, EventsClient } from '../../../api/generated-client';
import EventForm     from '../../components/forms/EventForm';
import {useAuth} from "../../../helpers/useAuth.ts";



const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const http = import.meta.env.VITE_API_HTTP_SCHEMA;
const API_URL =  http+ BASE_URL;

export default function EventsAdmin() {
    const { jwt } = useAuth();
    const client = new EventsClient(API_URL, {
        fetch: (url, init) => fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                'Authorization': `Bearer ${jwt}`
            }
        })
    });

    const [list, setList] = useState<EventDto[]>([]);
    const [editing, setEdit] = useState<EventDto | null>(null);

    useEffect(() => { refresh(); }, []);
    function refresh() { client.getAll().then(e => setList(e ?? [])); }

    function save(dto: EventDto) {
        const op = dto.id ? client.update(dto.id, dto) : client.create(dto);
        op.then(refresh).finally(() => setEdit(null));
    }
    function del(id?: string) {
        if (id) client.delete(id).then(refresh);
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Events</h1>
                <button className="btn btn-primary" onClick={() => setEdit({} as never)}>+ New</button>
            </div>
            <table className="table table-zebra w-full">
                <thead><tr><th>Title</th><th>Date</th><th></th></tr></thead>
                <tbody>
                {list.map(e => (
                    <tr key={e.id}>
                        <td>{e.title}</td>
                        <td>{new Date(e.date!).toLocaleDateString()}</td>
                        <td className="flex gap-2">
                            <button className="btn btn-sm" onClick={()=>setEdit(e)}>Edit</button>
                            <button className="btn btn-sm btn-error" onClick={()=>del(e.id)}>Del</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {editing && (
                <div className="modal modal-open">
                    <div className="modal-box w-96">
                        <h3 className="font-bold mb-2">{editing.id ? 'Edit' : 'New'} Event</h3>
                        <EventForm initial={editing} onSubmit={save} />
                        <div className="modal-action">
                            <button className="btn" onClick={()=>setEdit(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
