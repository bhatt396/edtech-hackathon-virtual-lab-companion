import { Classroom } from '@/utils/classroomStorage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Users, BookOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ClassroomCardProps {
    classroom: Classroom;
    isTeacher?: boolean;
    onAssignExperiment?: (classroomId: string) => void;
}

export function ClassroomCard({ classroom, isTeacher, onAssignExperiment }: ClassroomCardProps) {
    const handleCopyCode = () => {
        navigator.clipboard.writeText(classroom.joinCode);
        toast.success('Join code copied to clipboard!');
    };

    return (
        <Card className="flex flex-col border-border bg-card transition-all hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold font-display">{classroom.name}</CardTitle>
                        <CardDescription className="capitalize flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                                {classroom.subject}
                            </Badge>
                            {isTeacher && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {classroom.studentIds.length} Students
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    {isTeacher && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyCode}
                            className="font-mono text-xs font-bold tracking-wider"
                            title="Click to copy join code"
                        >
                            {classroom.joinCode}
                            <Copy className="h-3 w-3 ml-2" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-3">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Assigned Experiments ({classroom.assignedExperimentIds.length})
                    </div>
                    {classroom.assignedExperimentIds.length === 0 ? (
                        <div className="text-xs text-muted-foreground italic p-2 border border-dashed rounded bg-muted/30 text-center">
                            No experiments assigned yet.
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {classroom.assignedExperimentIds.map(id => (
                                <Badge key={id} variant="secondary" className="text-xs font-normal">
                                    {id}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>

            {isTeacher && onAssignExperiment && (
                <CardFooter className="pt-0">
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => onAssignExperiment(classroom.id)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Experiment
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
