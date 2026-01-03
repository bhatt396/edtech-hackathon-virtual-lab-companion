import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS } from '@/utils/constants';
import { createClassroom } from '@/utils/classroomStorage';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface CreateClassroomModalProps {
    onClassroomCreated: () => void;
}

export function CreateClassroomModal({ onClassroomCreated }: CreateClassroomModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState<string>('');
    const { user } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !subject || !user) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            createClassroom(name, subject, user.email || user.name); // Using email/name as ID for MVP
            toast.success('Classroom created successfully!');
            setOpen(false);
            setName('');
            setSubject('');
            onClassroomCreated();
        } catch (error) {
            toast.error('Failed to create classroom');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Classroom
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Classroom</DialogTitle>
                    <DialogDescription>
                        Create a space for your students to join and access assigned experiments.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Class Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Physics Grade 11 - Section A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select onValueChange={setSubject} value={subject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SUBJECTS.PHYSICS}>Physics</SelectItem>
                                <SelectItem value={SUBJECTS.CHEMISTRY}>Chemistry</SelectItem>
                                <SelectItem value={SUBJECTS.BIOLOGY}>Biology</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Classroom</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
