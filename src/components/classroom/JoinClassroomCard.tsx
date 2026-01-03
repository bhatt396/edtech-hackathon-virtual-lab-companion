import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { joinClassroom } from '@/utils/classroomStorage';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Users } from 'lucide-react';
import { toast } from 'sonner';

interface JoinClassroomCardProps {
    onClassroomJoined: () => void;
}

export function JoinClassroomCard({ onClassroomJoined }: JoinClassroomCardProps) {
    const [joinCode, setJoinCode] = useState('');
    const { user } = useAuth();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode || !user) return;

        const result = joinClassroom(user.email || user.name, joinCode);

        if (result.success) {
            toast.success(result.message);
            setJoinCode('');
            onClassroomJoined();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Card className="h-full border-border bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Join Classroom
                </CardTitle>
                <CardDescription>
                    Enter the 6-character code shared by your teacher.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleJoin} className="flex gap-2">
                    <Input
                        placeholder="Enter Code (e.g. LAB123)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="uppercase font-mono tracking-wider"
                        maxLength={6}
                    />
                    <Button type="submit" disabled={!joinCode}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Join
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
