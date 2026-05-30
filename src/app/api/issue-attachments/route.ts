import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCES_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY_S3 as string,
  },
  region: "ap-south-1",
});

const BUCKET_NAME = "wekraft-saas-upload-s3";
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  console.log("POST /api/issue-attachments - Upload request received");
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      console.error("No file found in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    console.log(
      `Processing issue attachment: ${file.name}, Size: ${file.size}, Type: ${file.type}, ProjectId: ${projectId}`,
    );

    // Validation: Max size 10MB for attachments
    if (file.size > 10 * 1024 * 1024) {
      console.warn("File too large");
      return NextResponse.json(
        { error: "File too large. Max 10MB allowed for attachments." },
        { status: 400 },
      );
    }

    // Quota Limit Check
    try {
      await convex.mutation(api.user.checkAndIncrementStorage, {
        projectId: projectId as any,
        fileSize: file.size,
      });
    } catch (quotaError: any) {
      console.warn("Storage quota check failed:", quotaError);
      return NextResponse.json(
        { error: quotaError.message || "Storage limit reached. Please upgrade your plan." },
        { status: 400 }
      );
    }


    const buffer = Buffer.from(await file.arrayBuffer());
    // Sanitize filename and add timestamp
    const sanitizedName = file.name
      .replace(/\s/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");
    const fileName = `issue-attachments/${Date.now()}-${sanitizedName}`;

    console.log(`Uploading issue attachment to S3 as: ${fileName}`);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await client.send(command);

    const url = `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;
    console.log("Issue attachment upload successful, URL:", url);

    return NextResponse.json({ success: true, url, name: file.name });
  } catch (error) {
    console.error("Error uploading issue attachment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("Attempting to delete issue attachment:", url);
    const key = url.split(".amazonaws.com/")[1];

    if (key && key.startsWith("issue-attachments/")) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      await client.send(deleteCommand);
      console.log("Issue attachment deleted from S3 successfully");
      return NextResponse.json({ success: true });
    } else {
      console.warn("Invalid key or not an issue-attachment key");
      return NextResponse.json(
        { error: "Invalid issue attachment URL" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error deleting issue attachment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
