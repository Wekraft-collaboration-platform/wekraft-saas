import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return new NextResponse("userId is required", { status: 400 });
        }

        if (!apiKey || !apiSecret) {
            console.error("Stream API configuration error: STREAM_API_KEY or STREAM_API_SECRET is missing.");
            return new NextResponse("Stream API is not configured on the server", { status: 500 });
        }

        const client = new StreamClient(apiKey, apiSecret);
        const token = client.generateUserToken({ user_id: userId });
        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}