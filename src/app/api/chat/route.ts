import { NextRequest, NextResponse } from "next/server";
import { searchWeb } from "@/utils/searchWeb";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key is not configured on the server" },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
//             {
//               role: "system",
//               content: `You are NOVA, a sharp and friendly AI assistant with personality. 
// Format responses using markdown:
// - Use \`code\` for inline code and \`\`\`language blocks for code samples
// - Use **bold** for emphasis and headers where appropriate  
// - Use bullet points and numbered lists for steps
// - Use tables for comparisons
// - Keep responses clear and well structured.
// Use emojis naturally where they add clarity or warmth — not excessively.

// Always format code blocks with a language tag, e.g. \`\`\`js, \`\`\`ts, \`\`\`bash.
// For file trees or plain text blocks use \`\`\`text.
// Never use unlabelled fenced blocks.
// `,
//             },

// {
//   role: "system",
//   content: `You are NOVA, a helpful AI assistant. Respond clearly, naturally, and concisely.

// ## Structure (REQUIRED)
// - For non-trivial answers, organize into sections.
// - Each section MUST start with: emoji + short heading.
//   Examples:
//   ## ✅ Answer
//   ## 🔍 Explanation
//   ## ⚙️ Steps
//   ## 💡 Tips
//   ## ⚠️ Notes

// ## Style
// - Be conversational, not robotic.
// - Use short paragraphs and lists when helpful.
// - No emojis inside text—only in headings.

// ## Behavior
// - Be accurate and practical.
// - Ask questions only if needed.
// - If unsure, say so.
// - Avoid unsafe or harmful guidance.

// Goal: clear, structured, easy-to-scan answers with emoji headings.`,
// },

{
  role: "system",
  content: `You are NOVA, a sharp and friendly AI assistant with personality. Respond clearly, naturally, and concisely.

- now Date is ${new Date()}.

- Optionally start responses with a short, friendly introductory paragraph before the first section heading, summarizing or setting up the topic in a conversational tone.

## Handling Post-Knowledge Cutoff Queries
- Your training data ends in 2023. For any query about events after this date, do NOT answer confidently.
- Instead, explicitly indicate uncertainty and **use searchWeb** to find up-to-date information.
- Always compare the query date to 'now' and your training cutoff before responding.
- If unsure then use searchWeb tool to get the latest information and refer to it in your response.

##Use the searchWeb tool ONLY when:
- ALWAYS for future, ongoing, or recent events
- You are unsure of the answer
- The user explicitly asks to search

##Do NOT use the tool for:
- Common knowledge
- Coding, math, or explanations

## Structure (REQUIRED, but NOT all sections needed)
- For non-trivial answers, organize into sections.
- Each section MUST start with: emoji + short heading.
  Examples:
  ## ✅ Answer
  ## 🔍 Explanation
  ## ⚙️ Steps
  ## 💡 Tips
  ## ⚠️ Notes

## Formatting
- Use markdown properly:
  - **bold** for emphasis and headings
  - \`code\` for inline code
  - \`\`\`language blocks for all code (ALWAYS include language tag: js, ts, bash, etc.)
  - \`\`\`text for file trees or plain text
- Use bullet points, numbered lists, and tables when helpful
- Never use unlabelled code blocks

## Style
- Be conversational, clear, and well-structured
- Avoid robotic tone or unnecessary filler
- Use emojis naturally in headings; avoid overuse in body text

## Behavior
- Be accurate and practical
- Provide actionable answers
- Ask questions only if needed
- If unsure, say so
- Avoid unsafe or harmful guidance

Goal: structured, easy-to-scan, helpful responses with clean markdown and emoji headings.`,
            },
            ...messages,
          ],
          max_tokens: 2000,
          temperature: 0.7,
          stream: true,
          tools: [
            {
              type: "function",
              function: {
                name: "searchWeb",
                description: "Search the web for current information on any topic",
                parameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "The search query to look up on the web",
                    },
                  },
                  required: ["query"],
                },
              },
            },
          ],
          tool_choice: "auto",
        }),
        signal: req.signal, // ✅ Use frontend's abort signal
      },
    );

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error?.message || `Groq error: ${response.status}` },
        { status: response.status },
      );
    }

    // Proxy the SSE stream directly to the client
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "No response body from Groq API" },
        { status: 500 },
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              
              const data = trimmed.slice(6).trim();
              if (data === "[DONE]") continue;
              
              try {
                const json = JSON.parse(data);
                
                // Handle tool calls
                if (json.choices?.[0]?.delta?.tool_calls) {
                  const toolCalls = json.choices[0].delta.tool_calls;
                  
                  for (const toolCall of toolCalls) {
                    if (toolCall.function?.name === "searchWeb" && toolCall.function.arguments) {
                      try {
                        const args = JSON.parse(toolCall.function.arguments);
                        const searchResults = await searchWeb({ query: args.query });
                        
                        // Send tool call result back to Groq
                        const toolResponse = {
                          role: "tool",
                          content: searchResults,
                          tool_call_id: toolCall.id,
                        };
                        
                        // Continue conversation with search results
                        const followUpResponse = await fetch(
                          "https://api.groq.com/openai/v1/chat/completions",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${apiKey}`,
                            },
                            body: JSON.stringify({
                              model: "llama-3.3-70b-versatile",
                              messages: [
                                {
                                  role: "system",
                                  content: `You are NOVA, a sharp and friendly AI assistant with personality. Respond clearly, naturally, and concisely.

now is ${new Date()}

##Use the searchWeb tool ONLY when:
- ALWAYS for future, ongoing, or recent events
- You are unsure of the answer
- The user explicitly asks to search

##Do NOT use the tool for:
- Common knowledge
- Coding, math, or explanations

-Optionally start responses with a short, friendly introductory paragraph before the first section heading, summarizing or setting up the topic in a conversational tone.

## Structure (REQUIRED)
- For non-trivial answers, organize into sections.
- Each section MUST start with: emoji + short heading.
  Examples:
  ## ✅ Answer
  ## 🔍 Explanation
  ## ⚙️ Steps
  ## 💡 Tips
  ## ⚠️ Notes

## Formatting
- Use markdown properly:
  - **bold** for emphasis and headings
  - \`code\` for inline code
  - \`\`\`language blocks for all code (ALWAYS include language tag: js, ts, bash, etc.)
  - \`\`\`text for file trees or plain text
- Use bullet points, numbered lists, and tables when helpful
- Never use unlabelled code blocks

## Style
- Be conversational, clear, and well-structured
- Avoid robotic tone or unnecessary filler
- Use emojis naturally in headings; avoid overuse in body text

## Behavior
- Be accurate and practical
- Provide actionable answers
- Ask questions only if needed
- If unsure, say so
- Avoid unsafe or harmful guidance

Goal: structured, easy-to-scan, helpful responses with clean markdown and emoji headings.`,
                                },
                                ...messages,
                                toolResponse,
                              ],
                              max_tokens: 2000,
                              temperature: 0.7,
                              stream: true,
                            }),
                            signal: req.signal,
                          }
                        );
                        
                        if (!followUpResponse.ok) {
                          throw new Error(`Follow-up request failed: ${followUpResponse.status}`);
                        }
                        
                        const followUpReader = followUpResponse.body?.getReader();
                        if (!followUpReader) {
                          throw new Error("No follow-up response body");
                        }
                        
                        // Stream the follow-up response
                        let followUpBuffer = "";
                        while (true) {
                          const { done: followUpDone, value: followUpValue } = await followUpReader.read();
                          if (followUpDone) break;
                          
                          followUpBuffer += decoder.decode(followUpValue, { stream: true });
                          const followUpLines = followUpBuffer.split("\n");
                          followUpBuffer = followUpLines.pop() ?? "";
                          
                          for (const followUpLine of followUpLines) {
                            controller.enqueue(encoder.encode(followUpLine + "\n"));
                          }
                        }
                        
                        followUpReader.releaseLock();
                        return; // Exit after handling tool call
                        
                      } catch (error) {
                        console.error("Error executing searchWeb:", error);
                        // Continue with original stream if tool call fails
                      }
                    }
                  }
                }
                
                // Pass through regular content
                controller.enqueue(encoder.encode(line + "\n"));
                
              } catch (parseError) {
                // Skip malformed JSON
                console.warn("Failed to parse SSE chunk:", parseError);
                controller.enqueue(encoder.encode(line + "\n"));
              }
            }
          }
        } catch (error) {
          console.log(
            "Stream ended:",
            error instanceof Error ? error.message : "Unknown error",
          );
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
      cancel() {
        console.log("Client disconnected from stream");
        reader.releaseLock();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
