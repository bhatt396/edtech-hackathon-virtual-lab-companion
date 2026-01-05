import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "../src/index.css";
import { Providers } from "@/components/providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Virtual Lab Companion - EdTech Platform",
    description: "Interactive virtual laboratory experiments for students and teachers",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
