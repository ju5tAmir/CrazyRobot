
interface Props {
    query: string;
    onQueryChange(q: string): void;
    view: 'grid' | 'list';
    onViewChange(v: 'grid' | 'list'): void;
    department: string;
    onDepartmentChange(d: string): void;
}

export default function ContactsToolbar(p: Props) {
    return (
        <div className="flex flex-wrap gap-3 items-end mb-6">
            <input
                type="text"
                placeholder="Search contacts…"
                className="input input-bordered w-60"
                value={p.query}
                onChange={e => p.onQueryChange(e.target.value)}
            />
            <div className="btn-group">
                <button className={`btn btn-sm ${p.view==='grid' && 'btn-active'}`} onClick={()=>p.onViewChange('grid')}>Grid</button>
                <button className={`btn btn-sm ${p.view==='list' && 'btn-active'}`} onClick={()=>p.onViewChange('list')}>List</button>
            </div>
            <select
                className="select select-bordered select-sm w-52"
                value={p.department}
                onChange={e => p.onDepartmentChange(e.target.value)}
            >
                <option value="">All Departments</option>
                <option>Construction & Technology</option>
                <option>Design</option>
                <option>Management</option>
                <option>Finance & Service</option>
                <option>IT & Media</option>
                <option>Communication & marketing</option>
                <option>Stab</option>
                <option>Knowledge & Business</option>
            </select>
        </div>
    );
}
