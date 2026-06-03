'use client';

import { StreamVideo, StreamVideoClient, type User } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function StreamVideoProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const [client, setClient] = useState<StreamVideoClient>();

    useEffect(() => {
        // Wait until Clerk has loaded and we have a real user
        if (!isLoaded || !user) return;

        if (!apiKey) {
            console.error("Stream Public API Key (NEXT_PUBLIC_STREAM_API_KEY) is missing.");
            return;
        }

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

        let _client: StreamVideoClient;

        // Fetch the Stream token from our server-side API route
        fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        })
            .then((res) => res.json())
            .then(({ token }) => {
                _client = new StreamVideoClient({ apiKey, user: streamUser, token });
                setClient(_client);
            });

        return () => {
            _client?.disconnectUser();
            setClient(undefined);
        };
    }, [isLoaded, user?.id]); // re-init only if the logged-in user changes

    if (!client) return <>{children}</>;

    return <StreamVideo client={client}>{children}</StreamVideo>;
}