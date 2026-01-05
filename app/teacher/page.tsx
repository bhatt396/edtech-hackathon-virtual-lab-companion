"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TeacherDashboard } from "@/page-components/teacher/TeacherDashboard";

export default function TeacherPage() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        redirect("/login");
    }

    if (!user?.role) {
        redirect("/choose-role");
    }

    if (user?.role !== "teacher") {
        redirect(`/${user?.role}`);
    }

    return <TeacherDashboard />;
}
