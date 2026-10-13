import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") || formData.get("file");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided in request." },
        { status: 400 }
      );
    }

    // Prepare Groq Whisper payload (whisper-large-v3, English only)
    const groqFormData = new FormData();
    groqFormData.append("file", audioFile, "audio.webm");
    groqFormData.append("model", "whisper-large-v3");
    groqFormData.append("language", "en");

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: groqFormData,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Groq STT Error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      text: (data.text || "").trim(),
    });
  } catch (error: any) {
    console.error("STT Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process audio transcription." },
      { status: 500 }
    );
  }
}
