import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { customAlphabet } from "nanoid"

export const runtime = "nodejs"

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 })
    }

    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size must be less than 2MB" }, { status: 400 })
    }

    // Check file type (JPG in any case)
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!["jpg", "jpeg"].includes(fileExtension || "")) {
      return NextResponse.json({ success: false, error: "Only JPG files are allowed" }, { status: 400 })
    }

    // Create unique filename using nanoid
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.(jpg|jpeg)$/i, "")
    const uniqueFileName = `${nanoid()}-${sanitizedName}.${fileExtension}`

    // Upload to Vercel Blob
    const blob = await put(uniqueFileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,  // 🔑
    })

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 })
  }
}





// import { type NextRequest, NextResponse } from "next/server"
// import { writeFile } from "fs/promises"
// import path from "path"
// import { customAlphabet } from "nanoid"

// export const runtime = "nodejs" // Ensure this is a Node.js runtime

// const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)

// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.formData()
//     const file: File | null = data.get("file") as unknown as File

//     if (!file) {
//       return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 })
//     }

//     // Check file size (2MB = 2 * 1024 * 1024 bytes)
//     if (file.size > 2 * 1024 * 1024) {
//       return NextResponse.json({ success: false, error: "File size must be less than 2MB" }, { status: 400 })
//     }

//     // Check file type (JPG in any case)
//     const fileExtension = file.name.split(".").pop()?.toLowerCase()
//     if (!["jpg", "jpeg"].includes(fileExtension || "")) {
//       return NextResponse.json({ success: false, error: "Only JPG files are allowed" }, { status: 400 })
//     }

//     // Create unique filename using nanoid and original extension
//     const uniqueFileName = `${nanoid()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
//     const fileName = `${uniqueFileName}.${fileExtension}`

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer()
//     const buffer = Buffer.from(bytes)

//     // Ensure the public/uploads directory exists
//     const uploadDir = path.join(process.cwd(), "public", "uploads")
//     try {
//       await import("fs").then((fs) => fs.promises.mkdir(uploadDir, { recursive: true }))
//     } catch (dirError) {
//       console.error("Failed to create upload directory:", dirError)
//       return NextResponse.json({ success: false, error: "Failed to create upload directory" }, { status: 500 })
//     }

//     // Save to public/uploads
//     const uploadPath = path.join(uploadDir, fileName)
//     await writeFile(uploadPath, buffer)

//     // Return the public URL
//     const imageUrl = `/uploads/${fileName}`

//     return NextResponse.json({
//       success: true,
//       imageUrl: imageUrl,
//       message: "File uploaded successfully",
//     })
//   } catch (error) {
//     console.error("Upload error:", error)
//     return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 })
//   }
// }
