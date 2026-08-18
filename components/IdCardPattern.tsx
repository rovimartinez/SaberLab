
export const IdCardPattern = () => (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute h-full w-full"
            style={{
                top: 0,
                left: '-50%',
                transform: 'translateY(0)',
            }}
        >
            <defs>
                <pattern
                    id="id-card-pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                >
                    <path d="M0 10h40M10 0v40" stroke="hsl(var(--primary) / 0.05)" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#id-card-pattern)" />
        </svg>
    </div>
);
