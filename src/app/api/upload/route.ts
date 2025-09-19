import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
    }

    // Prefer Cloudinary if configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const unsignedPreset = process.env.CLOUDINARY_UNSIGNED_PRESET;

    let url: string | null = null;

    if (cloudName && unsignedPreset) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", unsignedPreset);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: fd,
      });
      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        console.error("Cloudinary upload failed:", text);
        return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 502 });
      }
      const payload = await uploadRes.json();
      url = payload.secure_url || payload.url;
    }

    // Fallback to local storage if Cloudinary not configured
    if (!url) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const safeName = (file.name || "upload").toLowerCase().replace(/[^a-z0-9_.-]+/g, "-");
      const filename = `${Date.now()}-${safeName}`;
      const filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, buffer);
      url = `/uploads/${filename}`;
    }

    const media = await prisma.media.create({
      data: {
        url,
        mimeType: file.type,
        width: null,
        height: null,
        altText: form.get("alt")?.toString() || null,
      },
    });

    return NextResponse.json({ id: media.id, url: media.url });
  } catch (e) {
    console.error("Upload error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
