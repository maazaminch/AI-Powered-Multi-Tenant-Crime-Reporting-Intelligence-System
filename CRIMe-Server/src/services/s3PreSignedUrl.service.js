import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Generate presigned URL based on purpose
export default async function generatePresignedUrl(filename, type, purpose, referenceId) {
  let key;
  let bucket;

  if (purpose === "profile") {
    key = `profiles/${referenceId || "temp"}/${Date.now()}_${filename}`;
    bucket = process.env.PROFILE_BUCKET;
  } else if (purpose === "evidence") {
    if (!referenceId) throw new Error("caseId required for evidence");
    key = `evidence/${referenceId}/${Date.now()}_${filename}`;
    bucket = process.env.EVIDENCE_BUCKET;
  } else {
    throw new Error("Invalid purpose");
  }

  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: type,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key, region: process.env.AWS_REGION };

}


// POST /api/uploads/profile-url-public
// {
//   "filename": "me.png",
//   "type": "image/png",
//   "purpose": "profile"
// }
// Evidence:
// json
// Copy code
// POST /api/uploads/evidence-url
// {
//   "filename": "knife.mp4",
//   "type": "video/mp4",
//   "purpose": "evidence",
//   "referenceId": "caseId12345"
// }