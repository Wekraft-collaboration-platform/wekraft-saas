'use client';

import { StreamVideo, StreamVideoClient, type User } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { VideoOff } from 'lucide-react';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function StreamVideoProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const [client, setClient] = useState<StreamVideoClient>();
    const [initError, setInitError] = useState<string>();

    useEffect(() => {
        // Wait until Clerk has loaded and we have a real user
        if (!isLoaded || !user) return;

        if (!apiKey) {
            console.error('[StreamVideoProvider] NEXT_PUBLIC_STREAM_API_KEY is missing.');
            setInitError('Video calling is not configured. Please contact support.');
            return;
        }

        let _client: StreamVideoClient;
        let mounted = true;

        const userId = user.id;
        const userName =
            user.fullName ??
            user.username ??
            user.primaryEmailAddress?.emailAddress ??
            userId;

        const streamUser: User = {
            id: userId,
            name: userName,
            image: user.imageUrl,
        };

        // Fetch the Stream token from our server-side API route
        fetch('/api/team-meet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Token endpoint returned ${res.status}`);
                return res.json();
            })
            .then(({ token }) => {
                if (!mounted) return;
                _client = new StreamVideoClient({ apiKey, user: streamUser, token });
                setClient(_client);
                setInitError(undefined);
            })
            .catch((err) => {
                console.error('[StreamVideoProvider] Failed to initialize Stream client:', err);
                if (mounted) setInitError('Could not connect to video service. Please refresh and try again.');
            });

        return () => {
            mounted = false;
            _client?.disconnectUser();
            setClient(undefined);
        };
    }, [isLoaded, user?.id]); // re-init only if the logged-in user changes

    // Surface init errors inside a meet room — children outside meet rooms
    // still render normally so the rest of the workspace is unaffected.
    if (initError) {
        return (
            <>
                {children}
                {/* Portal-style warning injected via data attribute so meet
                    page components can optionally read it — kept non-blocking. */}
                <div data-stream-error={initError} className="hidden" aria-hidden="true" />
            </>
        );
    }

    if (!client) return <>{children}</>;

    return <StreamVideo client={client}>{children}</StreamVideo>;
}