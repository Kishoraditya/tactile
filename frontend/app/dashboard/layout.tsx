'use client';

import { Settings, User, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <Link href="/" className="font-bold text-xl text-blue-600">ToothBuddy</Link>
                <div className="flex gap-4">
                    <Link href="/dashboard/settings" className="p-2 rounded-full hover:bg-slate-100" aria-label="Settings">
                        <Settings className="w-6 h-6" />
                    </Link>
                    <Link href="/dashboard/profile" className="p-2 rounded-full hover:bg-slate-100" aria-label="Child Profile">
                        <User className="w-6 h-6" />
                    </Link>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
