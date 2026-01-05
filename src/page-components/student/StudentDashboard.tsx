"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { ExperimentCard } from '@/components/lab/ExperimentCard';
import { SubjectFilter } from '@/components/lab/SubjectFilter';
import { JoinClassroomCard } from '@/components/classroom/JoinClassroomCard';
import { ClassroomCard } from '@/components/classroom/ClassroomCard';
import { EXPERIMENTS, Subject, Experiment } from '@/utils/constants';
import { Classroom, getStudentClassrooms } from '@/utils/classroomStorage';
import {
  Trophy,
  Target,
  Flame,
  Clock,
  Star,
  Users,
  BookOpen
} from 'lucide-react';

const studentStats = [
  { label: 'Completed', value: '8', icon: Trophy, color: 'text-secondary' },
  { label: 'In Progress', value: '3', icon: Target, color: 'text-primary' },
  { label: 'Day Streak', value: '5', icon: Flame, color: 'text-destructive' },
  { label: 'Time Spent', value: '4.5h', icon: Clock, color: 'text-accent' },
];

export function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');

  // Classroom State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const fetchClassrooms = () => {
    if (user) {
      const data = getStudentClassrooms(user.email || user.name);
      setClassrooms(data);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  const assignedExperimentIds = classrooms.flatMap(c => c.assignedExperimentIds);

  const enhancedExperiments: Experiment[] = EXPERIMENTS.map(exp => ({
    ...exp,
    isAssigned: assignedExperimentIds.includes(exp.id),
    isCompleted: ['pendulum', 'ph-testing'].includes(exp.id),
  }));

  const assignedExperiments = enhancedExperiments.filter(exp => exp.isAssigned);
  const allExperiments = selectedSubject === 'all'
    ? enhancedExperiments
    : enhancedExperiments.filter(exp => exp.subject === selectedSubject);

  const handleStartExperiment = (id: string) => {
    router.push(`/experiment/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden text-slate-200">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="container relative z-10 py-10">
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Welcome back, {user?.name}!
            </h1>
            <span className="text-4xl animate-bounce">🔬</span>
          </div>
          <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
            Ready to dive into the world of science?
          </p>
        </div>

        {/* 1. Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {studentStats.map((stat, index) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md animate-slide-up group hover:bg-white/10 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
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

        {/* 2. My Classrooms Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                My Classrooms
              </h2>
            </div>
            <div className="w-full md:w-auto min-w-[300px]">
              <JoinClassroomCard onClassroomJoined={fetchClassrooms} />
            </div>
          </div>

          {classrooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {classrooms.map(classroom => (
                <ClassroomCard key={classroom.id} classroom={classroom} />
              ))}
            </div>
          )}
        </div>

        {/* 3. Assigned Experiments Section (Only if present) */}
        {assignedExperiments.length > 0 && (
          <div className="mb-12 animate-slide-up">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 text-secondary" />
              Assigned to You
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedExperiments.map((experiment, index) => (
                <div key={experiment.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <ExperimentCard experiment={experiment} onStart={handleStartExperiment} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-white/10 w-full mb-12" />

        {/* 4. All Experiments Section (Always visible) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-white" />
            Experiment Library
          </h2>
          <SubjectFilter selected={selectedSubject} onSelect={setSelectedSubject} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allExperiments.map((experiment, index) => (
            <div key={experiment.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <ExperimentCard experiment={experiment} onStart={handleStartExperiment} />
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
