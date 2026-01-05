"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { StudentDashboard } from "@/page-components/student/StudentDashboard";

export default function StudentPage() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        redirect("/login");
    }

    if (!user?.role) {
        redirect("/choose-role");
    }

    if (user?.role !== "student") {
        redirect(`/${user?.role}`);
    }

    return <StudentDashboard />;
}
