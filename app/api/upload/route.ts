import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { customAlphabet } from "nanoid"

export const runtime = "nodejs"

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const files = data.getAll("files") as File[] // Get all files

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 })
    }

    // Maximum 10 files per upload
    if (files.length > 10) {
      return NextResponse.json({ success: false, error: "Maximum 10 files allowed per upload" }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: `File ${file.name} exceeds 2MB size limit` }, { status: 400 })
      }

      // Check file type (JPG in any case)
      const fileExtension = file.name.split(".").pop()?.toLowerCase()
      if (!["jpg", "jpeg"].includes(fileExtension || "")) {
        return NextResponse.json({ success: false, error: `File ${file.name} is not a JPG/JPEG file` }, { status: 400 })
      }

      // Create unique filename using nanoid
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.(jpg|jpeg)$/i, "")
      const uniqueFileName = `${nanoid()}-${sanitizedName}.${fileExtension}`

      // Upload to Vercel Blob
      const blob = await put(uniqueFileName, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      uploadedUrls.push(blob.url)
    }

    return NextResponse.json({
      success: true,
      imageUrls: uploadedUrls,
      message: `${uploadedUrls.length} file(s) uploaded successfully`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload files" }, { status: 500 })
  }
}


