import OhmsCircuitAssembly from "@/experiments/interactive/OhmsCircuitAssembly";

export default function OhmsLabPage() {
    return (
        <main className="bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold text-center my-6">
                Ohm's Law – Hands-On Circuit Assembly
            </h1>
            <OhmsCircuitAssembly />
        </main>
    );
}
