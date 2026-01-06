import ChemistryLab from "@/experiments/interactive/chemistry/ChemistryLab";

export default function ChemistryLabPage() {
    return (
        <main className="bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold text-center py-6">
                Virtual Chemistry Lab – Acid-Base Titration
            </h1>
            <ChemistryLab />
        </main>
    );
}
