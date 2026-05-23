/**
 * API Route: POST /api/verify/compare-faces
 * Compare two face images using AWS Rekognition.
 * This runs SERVER-SIDE to keep AWS credentials secret.
 * AWS SDK is an optional dependency — install with: npm i @aws-sdk/client-rekognition
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse request
  const { selfie, idPhoto } = await request.json();
  if (!selfie || !idPhoto) {
    return NextResponse.json({ error: "Missing images" }, { status: 400 });
  }

  const awsRegion    = process.env.AWS_REGION ?? "eu-west-3";
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;

  // If AWS is not configured, return a mock score (for dev/demo)
  if (!awsAccessKey || !awsSecretKey) {
    console.warn("[FaceCompare] AWS not configured — returning mock similarity");
    return NextResponse.json({ similarity: 0.85, mock: true });
  }

  try {
    // Attempt to load AWS SDK — must be installed separately
    // npm install @aws-sdk/client-rekognition
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RekognitionClient, CompareFacesCommand } = require("@aws-sdk/client-rekognition") as {
      RekognitionClient: new (config: { region: string; credentials: { accessKeyId: string; secretAccessKey: string } }) => {
        send: (cmd: unknown) => Promise<{ FaceMatches?: { Similarity?: number }[] }>;
      };
      CompareFacesCommand: new (input: {
        SourceImage: { Bytes: Buffer };
        TargetImage: { Bytes: Buffer };
        SimilarityThreshold: number;
      }) => unknown;
    };

    const client = new RekognitionClient({
      region: awsRegion,
      credentials: { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey },
    });

    const selfieBytes  = Buffer.from(selfie.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const idPhotoBytes = Buffer.from(idPhoto.replace(/^data:image\/\w+;base64,/, ""), "base64");

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: selfieBytes },
      TargetImage: { Bytes: idPhotoBytes },
      SimilarityThreshold: 0,
    });

    const response = await client.send(command);
    const similarity = response.FaceMatches?.[0]?.Similarity ?? 0;

    return NextResponse.json({
      similarity: similarity / 100,
      matchCount: response.FaceMatches?.length ?? 0,
    });
  } catch (err) {
    console.error("[FaceCompare] Rekognition error:", err);
    return NextResponse.json({ error: "Face comparison failed" }, { status: 500 });
  }
}
