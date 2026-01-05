"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { ExperimentCard } from '@/components/lab/ExperimentCard';
import { SubjectFilter } from '@/components/lab/SubjectFilter';
import { CreateClassroomModal } from '@/components/classroom/CreateClassroomModal';
import { ClassroomCard } from '@/components/classroom/ClassroomCard';
import { AssignExperimentModal } from '@/components/classroom/AssignExperimentModal';
import { EXPERIMENTS, Subject } from '@/utils/constants';
import { Classroom, getTeacherClassrooms, assignExperimentToClassroom } from '@/utils/classroomStorage';
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const stats = [
  { label: 'Total Students', value: '45', icon: Users, color: 'text-primary' },
  { label: 'Experiments Assigned', value: '12', icon: BookOpen, color: 'text-secondary' },
  { label: 'Completion Rate', value: '78%', icon: TrendingUp, color: 'text-accent' },
  { label: 'Avg. Time', value: '32 min', icon: Clock, color: 'text-physics' },
];

export function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');

  // Classroom State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

  const fetchClassrooms = () => {
    if (user) {
      const data = getTeacherClassrooms(user.email || user.name);
      setClassrooms(data);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  const filteredExperiments = selectedSubject === 'all'
    ? EXPERIMENTS
    : EXPERIMENTS.filter(exp => exp.subject === selectedSubject);

  const handleStartExperiment = (id: string) => {
    router.push(`/experiment/${id}`);
  };

  // Assign Logic
  const handleOpenAssignModal = (classroomId: string) => {
    setSelectedClassroomId(classroomId);
    setAssignModalOpen(true);
  };

  const handleAssignExperiment = (experimentId: string) => {
    if (!selectedClassroomId) return;
    const success = assignExperimentToClassroom(selectedClassroomId, experimentId);
    if (success) {
      toast.success('Experiment assigned successfully');
      fetchClassrooms();
    } else {
      toast.info('Experiment already assigned');
    }
    setAssignModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden text-slate-200">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="container relative z-10 py-10">
        <div className="mb-10 animate-fade-in">
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-3 text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
            Manage your virtual classrooms and experiment library.
          </p>
        </div>

        {/* 1. Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md animate-slide-up group hover:bg-white/10 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Virtual Classrooms Section (NEW) */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              Your Classrooms
            </h2>
            <CreateClassroomModal onClassroomCreated={fetchClassrooms} />
          </div>

          {classrooms.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-slate-400 mb-4">You haven't created any classrooms yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom) => (
                <div key={classroom.id} className="animate-slide-up">
                  <ClassroomCard
                    classroom={classroom}
                    isTeacher
                    onAssignExperiment={handleOpenAssignModal}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-white/10 w-full mb-12" />

        {/* 3. Original Experiment Library Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-white">
            All Experiments
          </h2>
          <SubjectFilter selected={selectedSubject} onSelect={setSelectedSubject} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((experiment, index) => (
            <div
              key={experiment.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ExperimentCard
                experiment={experiment}
                onStart={handleStartExperiment}
              />
            </div>
          ))}
        </div>

        {/* Modal */}
        <AssignExperimentModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssignExperiment}
        />
      </main>
    </div>
  );
}
