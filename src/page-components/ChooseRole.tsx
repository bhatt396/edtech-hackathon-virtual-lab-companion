"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MolecularLogo } from '@/components/MolecularLogo';

export function ChooseRole() {
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // If user already has a role, redirect them
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            router.push(`/${user.role}`);
        }
    }, [isAuthenticated, user, router]);

    const handleConfirmRole = async () => {
        if (!selectedRole || !user) {
            toast.error('Please select a role to continue');
            return;
        }

        setIsSubmitting(true);
        try {
            // Save role to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                displayName: user.displayName,
                role: selectedRole,
                createdAt: new Date().toISOString(),
            }, { merge: true });

            toast.success(`Welcome to the lab!`);
            // AuthContext now uses onSnapshot, so role will update automatically
            router.push(`/${selectedRole}`);
        } catch (error) {
            console.error("Error saving role:", error);
            toast.error('Failed to save role. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl animate-fade-in">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-6 flex justify-center">
                        <MolecularLogo size={48} />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
                        One Last Step
                    </h1>
                    <p className="mt-2 text-muted-foreground font-medium uppercase tracking-widest text-xs">
                        Tell us who you are
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-medium">
                    <div className="mb-8 flex items-start gap-4 rounded-xl bg-primary/5 p-4 border border-primary/10">
                        <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Welcome, {user?.displayName}!</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                To personalize your experience, please select your role. Teachers can create classrooms and assign experiments, while students can perform and record results.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />

                        <Button
                            onClick={handleConfirmRole}
                            disabled={!selectedRole || isSubmitting}
                            size="lg"
                            className="w-full h-14 text-lg gap-2 shadow-glow-primary"
                        >
                            {isSubmitting ? 'Saving...' : 'Start My Journey'}
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    Your role determines your dashboard layout and available tools.
                </p>
            </div>
        </div>
    );
}
