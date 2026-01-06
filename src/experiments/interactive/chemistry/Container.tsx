import React from "react";
import { motion } from "framer-motion";

export default function Container({
    type,
    data,
}: {
    type: "beaker" | "flask" | "burette";
    data: {
        volume: number; // mL
        concentration?: number; // M
        pH?: number;
        color?: string;
    };
}) {
    const liquidHeight = Math.min(data.volume / 100, 1) * 100; // % of container height
    const liquidColor = data.color ?? "#fff";

    return (
        <div className={`container-${type} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}>
            <div className="border-2 border-gray-400 rounded-lg w-32 h-48 overflow-hidden bg-gray-800">
                <motion.div
                    className="liquid"
                    style={{ backgroundColor: liquidColor }}
                    initial={{ height: 0 }}
                    animate={{ height: `${liquidHeight}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <div className="mt-2 text-center">
                <p className="font-semibold">{type.toUpperCase()}</p>
                <p>{data.volume.toFixed(1)} ml</p>
                {data.concentration && <p>{data.concentration} M</p>}
                {data.pH && <p>pH {data.pH.toFixed(1)}</p>}
            </div>
        </div>
    );
}
