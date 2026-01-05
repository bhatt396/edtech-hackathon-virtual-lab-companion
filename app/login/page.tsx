"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Login } from "@/components/auth/Login";

export default function LoginPage() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (isAuthenticated && user?.role) {
        redirect(`/${user.role}`);
    }

    if (isAuthenticated && !user?.role) {
        redirect("/choose-role");
    }

    return <Login />;
}
