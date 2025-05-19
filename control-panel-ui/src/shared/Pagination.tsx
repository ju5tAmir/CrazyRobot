export default function Pagination({ total, current, onPageChange, answersPerPage }: {
    total: number,
    current: number,
    onPageChange: (page: number) => void,
    answersPerPage: number
}) {


    const pages = Math.ceil(total / answersPerPage);


    return (
        <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: pages }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`px-3 py-1 rounded ${
                        current === i + 1
                            ? 'bg-primary text-primary-content'
                            : 'bg-base-200 hover:bg-base-300'
                    }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
}