'use client';

import { useParams, useRouter } from 'next/navigation';
import { BrushingSession } from '@/components/brushing/brushing-session';
import { AgeGroup } from '@/lib/brushing-data';

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();

    // Validate age group or default to 1-4
    const ageGroup = (['1-4', '5-11', '12-18'].includes(params.ageGroup as string)
        ? params.ageGroup
        : '1-4') as AgeGroup;

    const handleComplete = () => {
        // Navigate back to dashboard after completion
        // In real app, we would POST to /api/sessions here
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000); // Give time for victory message
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950">
            <BrushingSession ageGroup={ageGroup} onComplete={handleComplete} />
        </div>
    );
}
