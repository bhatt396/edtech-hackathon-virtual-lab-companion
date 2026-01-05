"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LandingPage } from "@/page-components/LandingPage";

export default function HomePage() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (isAuthenticated && user?.role) {
        redirect(`/${user.role}`);
    }

    if (isAuthenticated && !user?.role) {
        redirect("/choose-role");
    }

    return <LandingPage />;
}
