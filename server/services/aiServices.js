require("dotenv").config();
const {GoogleGenAI} = require("@google/genai");
const geminiApiKey=process.env.GEMINI_API_KEY;
if(!geminiApiKey){
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined to environment variables");
}
const genAI=new GoogleGenAI(geminiApiKey);
async function generateProductDescription(productName,category){
    const prompt=
    "You are an expert e-commerce copywriter.\n"+
    "Write a catchy, SEO-friendly product Description (max " +
    "100 words) for" + productName + "\n"+
    " under the category" + category + ".\n" + 
    "Tone:Professional yet exciting.";
    try{
        const result=await genAI.models   .generateContent(
            {
                model:"gemini-2.5-flash",
                contents:prompt
            }
        );
        return result.text;
    }catch(error){
        console.error("Error grnerating product description:",error);
        return "Description unavailable";
    }
}
async function generateProductDetailsFromImage(imageBuffer, mimeType) {
    // 1. Define thse schema for strict JSON output
    // 2. Initialize the model (using standard flash model without strict schema for stability)

    console.log("In generateProductDetailsFromImage", imageBuffer, mimeType);
    // 3. Convert Buffer to Generative Part
    const imagePart = {
        inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: mimeType,
        },
    };

    const prompt = `
        Analyze this product image and extract the details for an e-commerce listing.
        Return ONLY a JSON object with the following properties:
        {
            "name": "A short, catchy product title",
            "description": "A catchy, SEO-friendly product description (max 100 words)",
            "category": "The most appropriate category"
        }
        Do not include markdown formatting like \`\`\`json.
    `;

    try {
        console.log(`Generating details for image. Size: ${imageBuffer.length}, Type: ${mimeType}`);
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        imagePart
                    ]
                }
            ]
        });
        const text = result.text.replace(/```json|```/g, '').trim(); // Clean up markdown if present
        console.log("Gemini Response:", text);
        return JSON.parse(text);
    } catch (error) {
        console.error("Vision Error Full:", error);
        if (error.response) {
            console.error("Vision Error Response:", JSON.stringify(error.response, null, 2));
        }
        throw new Error("Failed to analyze image");
    }
}
async function generateEmbedding(text) {
    try {
        const result = await genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text
        });
        return result.embeddings[0].values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}
module.exports={
   generateProductDescription,generateProductDetailsFromImage,generateEmbedding
}