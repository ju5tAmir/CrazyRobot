
interface Props {
    query: string;
    onQueryChange(q: string): void;
    view: 'grid' | 'list';
    onViewChange(v: 'grid' | 'list'): void;
    category: string;
    onCategoryChange(c: string): void;
    status: string;
    onStatusChange(s: string): void;
}

export default function EventsToolbar(p: Props) {
    return (
        <div className="flex flex-wrap gap-3 items-end mb-6">
            <input
                type="text"
                placeholder="Search events…"
                className="input input-bordered w-60"
                value={p.query}
                onChange={e => p.onQueryChange(e.target.value)}
            />
            <div className="btn-group">
                <button className={`btn btn-sm ${p.view==='grid' && 'btn-active'}`} onClick={()=>p.onViewChange('grid')}>Grid</button>
                <button className={`btn btn-sm ${p.view==='list' && 'btn-active'}`} onClick={()=>p.onViewChange('list')}>List</button>
            </div>
            <select
                className="select select-bordered select-sm w-44"
                value={p.category}
                onChange={e=>p.onCategoryChange(e.target.value)}
            >
                <option value="">All Categories</option>
                <option>Sport</option>
                <option>Holiday</option>
                <option>Meeting</option>
                <option>Workshop</option>
            </select>
            <select
                className="select select-bordered select-sm w-40"
                value={p.status}
                onChange={e=>p.onStatusChange(e.target.value)}
            >
                <option value="">All Statuses</option>
                <option value="0">Upcoming</option>
                <option value="1">Ongoing</option>
                <option value="2">Past</option>
            </select>
        </div>
    );
}
