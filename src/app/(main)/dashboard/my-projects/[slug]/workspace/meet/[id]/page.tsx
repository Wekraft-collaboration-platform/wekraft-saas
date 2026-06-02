'use client';

import {
    StreamCall, StreamTheme, SpeakerLayout, CallControls,
    useCallStateHooks, CallingState, useStreamVideoClient,
    type Call,
} from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import '@stream-io/video-react-sdk/dist/css/styles.css';

export default function MeetingPage() {
    const { id, slug } = useParams<{ id: string; slug: string }>();
    const client = useStreamVideoClient();
    const router = useRouter();
    const [call, setCall] = useState<Call>();

    useEffect(() => {
        if (!client) return;

        const _call = client.call('default', id);
        _call.join({ create: true });
        setCall(_call);

        return () => {
            _call.leave().catch(() => null);
        };
    }, [client, id]);

    if (!call) {
        return (
            <div className="flex h-screen items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Joining meeting…</span>
            </div>
        );
    }

    return (
        <StreamCall call={call}>
            <MyMeetingUI slug={slug} />
        </StreamCall>
    );
}

function MyMeetingUI({ slug }: { slug: string }) {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const router = useRouter();

    const handleLeave = () => {
        router.push(`/dashboard/my-projects/${slug}/workspace/meet`);
    };

    if (callingState !== CallingState.JOINED) {
        return (
            <div className="flex h-screen items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Connecting…</span>
            </div>
        );
    }

    return (
        <StreamTheme>
            <SpeakerLayout participantsBarPosition="bottom" />
            <CallControls onLeave={handleLeave} />
        </StreamTheme>
    );
}