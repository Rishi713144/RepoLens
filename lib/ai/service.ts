
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function streamCompletion(prompt: string, apiKey?: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      
      const modelsToTry = [
          "gemini-2.0-flash", 
          "gemini-1.5-flash", 
          "gemini-1.5-flash-001",
          "gemini-1.5-pro", 
          "gemini-pro",
          "gemini-3-flash-preview"
      ];
      
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting Gemini model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContentStream(prompt);
            return new ReadableStream({
                async start(controller) {
                  try {
                    for await (const chunk of result.stream) {
                      const chunkText = chunk.text();
                      if (chunkText) {
                        controller.enqueue(encoder.encode(chunkText));
                      }
                    }
                  } catch (e) {
                    console.error(`Stream error on ${modelName}`, e);
                    controller.enqueue(encoder.encode(`\n\n[Error streaming from ${modelName}]\n`));
                  } finally {
                    controller.close();
                  }
                },
            });

        } catch (e: any) {
            console.warn(`Failed model ${modelName}: ${e.message}`);
            lastError = e;
            continue; 
        }
      }
      if (lastError) throw lastError;

    } catch (error: any) {
      console.error("All Gemini Models Failed:", error);
      const errorMessage = error.response ? 
        `API Error ${error.response.status}: ${error.response.statusText}` : 
        error.message;
      console.log("Injecting error to mock");
      return new ReadableStream({
        start(controller) {
             const msg = `
# Gemini API Error

Unable to generate explanation. 
**Error Details:** ${errorMessage}

**Troubleshooting:**
1. Check if \`gemini-2.0-flash\` or \`gemini-1.5-flash\` are enabled in your Google Cloud Project.
2. If you see "429", your free quota is exhausted.
3. Verify your API Key in \`.env.local\`.
`;
             controller.enqueue(encoder.encode(msg));
             controller.close();
        }
      });
    }
  }

  if (apiKey?.startsWith("sk-")) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { 
                role: "system", 
                content: "You are an expert Senior software Architect and Engineer. Your goal is to explain complex codebases clearly, accurately, and educationally to developers of varying skill levels. Use markdown heavily for readability." 
            },
            { role: "user", content: prompt }
          ],
          stream: true,
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const originalReader = res.body?.getReader();
      if (!originalReader) throw new Error("No response body");

      return new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await originalReader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");
            
            for (const line of lines) {
              if (line === "data: [DONE]") continue;
              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.substring(6));
                  const content = json.choices[0]?.delta?.content || "";
                  controller.enqueue(encoder.encode(content));
                } catch (e) {
                   console.error("Error parsing stream", e);
                }
              }
            }
          }
          controller.close();
        },
      });
    } catch (e) {
      console.error("OpenAI Error:", e);
    }
  }

  console.log("Using Mock Response (No valid API key found or API failed)");
  
  const mockResponse = `
# Analysis of Code (Mock Mode)

It seems you haven't provided a valid API Key (Gemini or OpenAI), or the API call failed.

### How to Enable AI:
1. **Gemini**: Add \`GOOGLE_GENERATIVE_AI_API_KEY\` to your \`.env.local\` file.
2. **OpenAI**: Enter your OpenAI API Key in the settings dialog (bottom left).

---

Here is a simulated explanation based on your request:
**Prompt received:** "${prompt.substring(0, 50)}..."

The code appears to be a modern TypeScript/JavaScript Setup.
- Structure suggests Next.js or similar metadata.
- Clean code usage.

To get a real analysis, please configure the API keys.
`;

  const stream = new ReadableStream({
    start(controller) {
      const tokens = mockResponse.split("");
      let i = 0;
      function push() {
        if (i < tokens.length) {
          const chunk = tokens.slice(i, i + 5).join(""); 
          controller.enqueue(encoder.encode(chunk));
          i += 5;
          setTimeout(push, 10);
        } else {
          controller.close();
        }
      }
      push();
    },
  });

  return stream;
}
