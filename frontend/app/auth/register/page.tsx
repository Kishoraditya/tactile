'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8000/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error('Registration failed');
            }

            router.push('/auth/login');
        } catch (err: any) {
            setError('Registration failed. Email might be taken.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Sign up for ToothBuddy</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="parent@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full">Register</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
