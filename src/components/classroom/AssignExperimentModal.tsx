import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EXPERIMENTS } from "@/utils/constants";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AssignExperimentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (experimentId: string) => void;
}

export function AssignExperimentModal({ isOpen, onClose, onAssign }: AssignExperimentModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredExperiments = EXPERIMENTS.filter(exp =>
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <div className="p-6 pb-4 border-b">
                    <DialogHeader>
                        <DialogTitle>Assign Experiment</DialogTitle>
                        <DialogDescription>
                            Select an experiment to assign to your classroom.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search experiments..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2">
                    <div className="space-y-3">
                        {filteredExperiments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No experiments found.</p>
                        ) : (
                            filteredExperiments.map((experiment) => (
                                <div
                                    key={experiment.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <h4 className="font-medium leading-none">{experiment.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs font-normal">
                                                {experiment.subject}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {experiment.difficulty} • {experiment.duration}
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => onAssign(experiment.id)}>
                                        Assign
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
