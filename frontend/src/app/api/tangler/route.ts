import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url1, url2 } = await request.json();
    console.log("Received URLs:", url1, url2);
    if (!url1 || !url2) {
      return NextResponse.json(
        { error: "Both url1 and url2 are required." },
        { status: 400 }
      );
    }
    const backendUrl = process.env.NEXT_PUBLIC_TANGLE_URL;
    const response = await fetch(`${backendUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url1: url1,
          url2: url2
        })
    });
    if (!response.ok)
        throw new Error("Failed to post links to Tangle API");
    // if (!response.body)
        // throw new Error("No response body from Tangle API");
    
    const arrayBuffer = await response.arrayBuffer();
    const uint = new Uint8Array(arrayBuffer);
    console.log("Mash Buffer:", uint);
    return NextResponse.json({
        uint: uint
    });
  } catch (error: unknown) {
    console.log((await request.json()));
    const msg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const runtime = "edge";