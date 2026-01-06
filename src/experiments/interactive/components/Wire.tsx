import React, { useEffect, useRef } from "react";

interface Props {
    from: { x: number; y: number };
    to: { x: number; y: number };
    active: boolean; // true when current flows
}

export default function Wire({ from, to, active }: Props) {
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        if (active && pathRef.current) {
            pathRef.current.classList.add("glow");
            const t = setTimeout(() => {
                pathRef.current?.classList.remove("glow");
            }, 1500);
            return () => clearTimeout(t);
        }
    }, [active]);

    return (
        <svg className="wire-svg" style={{ position: "absolute" }}>
            <path
                ref={pathRef}
                d={`M${from.x},${from.y} L${to.x},${to.y}`}
                stroke={active ? "#00ff99" : "#777"}
                strokeWidth={4}
                strokeLinecap="round"
            />
        </svg>
    );
}
