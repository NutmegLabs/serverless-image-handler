const { handler } = require("../index");
const fs = require("fs");
const path = require("path");

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, "test-images");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Helper function to save base64 image
const saveBase64Image = (base64Data, filename) => {
  const imagePath = path.join(testDir, filename);
  fs.writeFileSync(imagePath, Buffer.from(base64Data, "base64"));
  console.log(`Saved image to: ${imagePath}`);
  return imagePath;
};

// Mock environment variables
process.env.CORS_ENABLED = "Yes";
process.env.CORS_ORIGIN = "*";
process.env.SOURCE_BUCKETS = "ntmg-media"; // Set this to match the bucket in the request

// Test function to process an image
async function testImageProcessing() {
  try {
    // Create the event object that mimics API Gateway
    const event = {
      path: "/eyJidWNrZXQiOiJudG1nLW1lZGlhIiwia2V5IjoiZDQ4MDJkYjgtNDU2Ni01N2Q3LTlmNzQtNWY4MzU1MjhmMmY2L3R1dC9mNmI4YmZmOC1lYzAzLTQ1YzEtYTdkNS00N2MyYWYxNzZlYTkuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7ImhlaWdodCI6ODAwLCJmaXQiOiJjb3ZlciJ9fX0=",
      headers: {
        Accept: "image/webp,image/jpeg", // Test WebP support
      },
    };

    // Decode and log the request details
    const decodedPath = Buffer.from(
      event.path.replace(/^\//, ""),
      "base64"
    ).toString("utf-8");
    console.log("\nDecoded request:", JSON.parse(decodedPath));

    // Call the actual Lambda handler
    const response = await handler(event);

    // Log the response details
    console.log("\nResponse Status Code:", response.statusCode);
    console.log("\nResponse Headers:");
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    // Save the processed image if successful
    if (response.statusCode === 200) {
      const imageData = response.isBase64Encoded
        ? response.body
        : Buffer.from(response.body).toString("base64");
      const extension = response.headers["Content-Type"].split("/")[1] || "jpg";
      const savedPath = saveBase64Image(
        imageData,
        `processed-image.${extension}`
      );
      console.log(
        `\nImage processing completed! The image has been saved to: ${savedPath}`
      );
    }

    return response;
  } catch (error) {
    console.error("Error during test:", error);
    throw error;
  }
}

// Run the test
testImageProcessing()
  .then((response) => {
    if (response.statusCode !== 200) {
      console.error("\nError Response Body:", response.body);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
