'use client';

import {
    StreamCall, StreamTheme, SpeakerLayout, CallControls,
    useCallStateHooks, CallingState, useStreamVideoClient, useCall,
    type Call,
} from '@stream-io/video-react-sdk';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, VideoOff } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from 'convex/react';

import { useProjectPermissions } from '@/hooks/use-project-permissions';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Id } from '../../../../../../../../../convex/_generated/dataModel';
import { api } from '../../../../../../../../../convex/_generated/api';

export default function MeetingPage() {
    const { id, slug } = useParams<{ id: string; slug: string }>();
    const client = useStreamVideoClient();
    const router = useRouter();

    const [call, setCall] = useState<Call>();
    const [fatalError, setFatalError] = useState<string>();

    // ── Bug 2 fix: prevent double-join ─────────────────────────────────────
    // useEffect can fire multiple times (Strict Mode, client state change).
    // This ref ensures join() is called exactly once per (client, id) pair.
    const hasJoined = useRef(false);

    // ── Bug 3 fix: know if the current user is host ─────────────────────────
    const project = useQuery(api.project.getProjectBySlug, { slug });
    const { isOwner, isAdmin, isLoading: permLoading } = useProjectPermissions(
        project?._id as Id<'projects'> | undefined
    );
    const isHost = isOwner || isAdmin;

    useEffect(() => {
        // Wait for the Stream client to be ready
        if (!client) return;

        // Bug 2 fix: bail out if we've already kicked off a join for this call
        if (hasJoined.current) return;

        let _call: Call | undefined;
        let mounted = true;

        const initCall = async () => {
            _call = client.call('default', id);

            try {
                // ── Bug 1 fix: fetch live call state BEFORE joining ────────
                // call.get() retrieves current server-side state including endedAt.
                await _call.get();

                // If the call already has an endedAt timestamp it's over — don't join.
                if (_call.state.endedAt) {
                    if (!mounted) return;
                    toast.error('This meeting has already ended.');
                    router.push(`/dashboard/my-projects/${slug}/workspace/meet`);
                    return;
                }

                // Call exists and is live — join without re-creating.
                if (!mounted) return;
                hasJoined.current = true;
                await _call.join({ create: false });

            } catch {
                // call.get() threw — the call record doesn't exist yet.
                // This happens when the host navigates here immediately after
                // pressing "New Meeting" (Stream creates on first join).
                if (!mounted) return;
                hasJoined.current = true;
                await _call.join({ create: true });
            }

            if (mounted) setCall(_call);
        };

        initCall().catch((err) => {
            console.error('[MeetingPage] failed to join call:', err);
            if (mounted) setFatalError('Could not connect to the meeting. Please try again.');
        });

        return () => {
            mounted = false;
            // Reset the guard so a future navigation to the same URL works correctly
            hasJoined.current = false;
            _call?.leave().catch(() => null);
        };
    }, [client, id]);  // intentionally omit router/slug — stable across renders

    // ── Render: fatal error state ───────────────────────────────────────────
    if (fatalError) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black">
                <VideoOff className="w-10 h-10 text-destructive" />
                <p className="text-sm text-muted-foreground">{fatalError}</p>
            </div>
        );
    }

    // ── Render: loading / connecting ────────────────────────────────────────
    if (!call) {
        return (
            <div className="flex h-screen items-center justify-center gap-3 bg-black">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Joining meeting…</span>
            </div>
        );
    }

    return (
        <StreamCall call={call}>
            <MyMeetingUI slug={slug} isHost={isHost} permLoading={permLoading} />
        </StreamCall>
    );
}

// ─── Inner UI — lives inside StreamCall context ──────────────────────────────
function MyMeetingUI({
    slug,
    isHost,
    permLoading,
}: {
    slug: string;
    isHost: boolean;
    permLoading: boolean;
}) {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const router = useRouter();

    // useCall() gives us the active Call object from StreamCall context.
    // This is the correct way to access it inside <StreamCall>.
    const call = useCall();

    // ── Bug 3 fix: listen for remote "call ended" event ─────────────────────
    // When the host calls call.endCall(), Stream broadcasts a `call.ended`
    // event to every participant. We listen here so all members are
    // automatically redirected back to the meet lobby.
    useEffect(() => {
        if (!call) return;

        const handleCallEnded = () => {
            toast.info('The meeting was ended by the host.');
            router.push(`/dashboard/my-projects/${slug}/workspace/meet`);
        };

        call.on('call.ended', handleCallEnded);

        return () => {
            call.off('call.ended', handleCallEnded);
        };
    }, [call, router, slug]);

    // ── Bug 3 fix: host ends for everyone; members just leave ────────────────
    const handleLeave = async () => {
        if (!call) {
            router.push(`/dashboard/my-projects/${slug}/workspace/meet`);
            return;
        }

        try {
            if (isHost) {
                // endCall() terminates the call server-side and broadcasts
                // `call.ended` to every connected participant.
                await call.endCall();
            } else {
                await call.leave();
            }
        } catch (err) {
            console.warn('[MeetingUI] leave/end error:', err);
        } finally {
            router.push(`/dashboard/my-projects/${slug}/workspace/meet`);
        }
    };

    // Waiting for Stream to confirm JOINED state
    if (callingState !== CallingState.JOINED) {
        return (
            <div className="flex h-screen items-center justify-center gap-3 bg-black">
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