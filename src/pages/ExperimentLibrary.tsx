import { useNavigate } from 'react-router-dom';
import { EXPERIMENTS } from '@/utils/constants';
import { ExperimentCard } from '@/components/lab/ExperimentCard';
import { Navbar } from '@/components/common/Navbar';
import { BookOpen } from 'lucide-react';

export function ExperimentLibrary() {
    const navigate = useNavigate();

    const handleStartExperiment = (id: string) => {
        navigate(`/experiment/${id}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container py-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">Experiment Library</h1>
                        <p className="text-muted-foreground">Browse and explore preloaded experiments</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {EXPERIMENTS.map((experiment) => (
                        <ExperimentCard
                            key={experiment.id}
                            experiment={experiment}
                            onStart={handleStartExperiment}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
