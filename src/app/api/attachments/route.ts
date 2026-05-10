import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCES_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY_S3 as string,
  },
  region: "ap-south-1",
});

const BUCKET_NAME = "wekraft-saas-upload-s3";

export async function POST(req: Request) {
  console.log("POST /api/attachments - Upload request received");
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file found in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(
      `Processing attachment: ${file.name}, Size: ${file.size}, Type: ${file.type}`,
    );

    // Validation: Max size 10MB for attachments
    if (file.size > 10 * 1024 * 1024) {
      console.warn("File too large");
      return NextResponse.json(
        { error: "File too large. Max 10MB allowed for attachments." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Sanitize filename and add timestamp
    const sanitizedName = file.name
      .replace(/\s/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");
    const fileName = `attachments/${Date.now()}-${sanitizedName}`;

    console.log(`Uploading attachment to S3 as: ${fileName}`);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await client.send(command);

    const url = `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;
    console.log("Attachment upload successful, URL:", url);

    return NextResponse.json({ success: true, url, name: file.name });
  } catch (error) {
    console.error("Error uploading attachment:", error);
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

    console.log("Attempting to delete attachment:", url);
    const key = url.split(".amazonaws.com/")[1];

    if (key && key.startsWith("attachments/")) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      await client.send(deleteCommand);
      console.log("Attachment deleted from S3 successfully");
      return NextResponse.json({ success: true });
    } else {
      console.warn("Invalid key or not an attachment key");
      return NextResponse.json(
        { error: "Invalid attachment URL" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
