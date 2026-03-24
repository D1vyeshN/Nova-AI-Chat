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

    // Helper function to get system prompt
    const getSystemPrompt = () => `You are NOVA, a sharp, friendly, and professional AI assistant. Respond clearly, naturally, and concisely.

## Time Awareness
- The current date is provided by system. Use it when reasoning about time-sensitive queries.

## Tool Usage (searchWeb)

ALWAYS use searchWeb when:
- The query involves a year >= current year (e.g., 2025, 2026, etc.)
- The query includes words like: "latest", "recent", "today", "new", "upcoming"
- The information could change or may not be in training data
- You are uncertain or lack confidence
- The user explicitly asks for latest/current info

Do NOT use searchWeb for:
- Common knowledge
- Coding, math, or general explanations

When using searchWeb:
- Base your answer on retrieved results
- Reflect up-to-date and verified information
- Do not fabricate details beyond results
- Rewrite the user query into a clear and specific search query
- Example: "i want 2026 data" → "latest South Indian movies 2026 IMDb list"

## Anti-Hallucination Rules (CRITICAL)
- Never generate or guess names of movies, products, or events if unsure
- If exact data is required and not known, you MUST use searchWeb
- If you cannot verify the information, say you are unsure and use searchWeb
- Do NOT fabricate examples or make up information

If the user query is ambiguous, infer intent from recent context and rewrite it into a clear search query before calling tools.

Never mention tool usage (e.g., "I will search").
Always return the final answer directly to the user.

## Response Structure
- For simple questions: respond directly
- For medium/complex questions: organize into sections

Each section MUST start with:
emoji + short heading (e.g., ## ✅ Answer, ## 🔍 Explanation)

Optionally include a short, friendly intro before sections.

## Formatting
- Use clean markdown
- **bold** for emphasis
- \`code\` for inline
- \`\`\`language for code blocks (REQUIRED)
- Use lists/tables where helpful

## Style
- Clear, conversational, and professional
- Avoid verbosity and filler
- Emojis ONLY in headings

## Behavior
- Prioritize accuracy and clarity
- Provide actionable answers
- Do not hallucinate facts or APIs
- If unsure, say so clearly

Goal: structured, easy-to-scan, and reliable responses.`;

    // Clean message history to avoid context pollution with hallucinated answers
    const cleanedMessages = messages.slice(-8); // Keep only last 8 messages
    
    // Smart tool router - force tool usage for future data and critical keywords
    const lastUserMessage = cleanedMessages.filter((m: { role: string; content: string }) => m.role === 'user').pop()?.content || '';
    const shouldForceTool = /\b(2025|2026|2027|2028|2029|2030)\b|latest|recent|new|upcoming|today|now|current/i.test(lastUserMessage);
    
    // console.log("Smart router analysis:", { lastUserMessage, shouldForceTool });

    // Step 1: Tool Detection Phase (Non-Streaming)
    const detectionResponse = await fetch(
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
              content: getSystemPrompt()
            },
            ...cleanedMessages,
          ],
          max_tokens: 2000,
          temperature: 0.7,
          stream: false,
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
          tool_choice: shouldForceTool ? {
            type: "function",
            function: { name: "searchWeb" }
          } : "auto",
        }),
        signal: req.signal,
      },
    );

    if (!detectionResponse.ok) {
      const err = await detectionResponse.json();
      return NextResponse.json(
        { error: err.error?.message || `Groq error: ${detectionResponse.status}` },
        { status: detectionResponse.status },
      );
    }

    const detectionData = await detectionResponse.json();
    const toolCall = detectionData.choices?.[0]?.message?.tool_calls;
    const assistantMessage = detectionData.choices?.[0]?.message;

    // Step 2: Branch Logic
    if (toolCall && toolCall.length > 0) {
      // Tool is needed - Execute tool and stream final answer
      const toolCallData = toolCall[0];
      
      if (toolCallData.function?.name === "searchWeb") {
        try {
          // Validate JSON arguments before parsing
          let parsedArgs;
          try {
            parsedArgs = JSON.parse(toolCallData.function.arguments || "{}");
          } catch (parseError) {
            console.error("Failed to parse tool arguments:", parseError);
            return NextResponse.json(
              { error: "Invalid tool arguments format" },
              { status: 400 }
            );
          }

          if (!parsedArgs.query) {
            return NextResponse.json(
              { error: "Missing required query parameter" },
              { status: 400 }
            );
          }

          // console.log("Executing searchWeb with args:", parsedArgs);
          
          const searchResults = await searchWeb({ query: parsedArgs.query });
          // console.log("Search results:", searchResults);
          
          // Step 3: Stream final answer with tool results
          const continuationResponse = await fetch(
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
                    content: getSystemPrompt()
                  },
                  ...cleanedMessages,
                  {
                    role: "assistant",
                    content: assistantMessage?.content || "",
                    tool_calls: [
                      {
                        id: toolCallData.id,
                        type: "function",
                        function: {
                          name: "searchWeb",
                          arguments: toolCallData.function.arguments
                        }
                      }
                    ]
                  },
                  {
                    role: "tool",
                    content: searchResults,
                    tool_call_id: toolCallData.id,
                  },
                ],
                max_tokens: 2000,
                temperature: 0.7,
                stream: true,
              }),
              signal: req.signal,
            }
          );
          
          if (!continuationResponse.ok) {
            throw new Error(`Continuation failed: ${continuationResponse.status}`);
          }
          
          // Stream the response directly
          const reader = continuationResponse.body?.getReader();
          if (!reader) {
            throw new Error("No continuation response body");
          }
          
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
          
          const stream = new ReadableStream({
            async start(controller) {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  controller.enqueue(encoder.encode(decoder.decode(value, { stream: true })));
                }
              } catch (error) {
                console.error("Streaming error:", error);
                const errorResponse = `data: ${JSON.stringify({
                  choices: [{
                    delta: {
                      content: "I encountered an error while processing the search results. Please try again."
                    }
                  }]
                })}\n\n`;
                controller.enqueue(encoder.encode(errorResponse));
              } finally {
                reader.releaseLock();
                controller.close();
              }
            },
            cancel() {
              console.log("Client disconnected from continuation stream");
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
          
        } catch (error) {
          console.error("Tool execution error:", error);
          return NextResponse.json(
            { error: `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Unknown tool: ${toolCallData.function?.name}` },
          { status: 400 }
        );
      }
    } else {
      // No tool needed - Stream the response directly
      const streamResponse = await fetch(
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
                content: getSystemPrompt()
              },
              ...cleanedMessages,
            ],
            max_tokens: 2000,
            temperature: 0.7,
            stream: true,
          }),
          signal: req.signal,
        }
      );
      
      if (!streamResponse.ok) {
        const err = await streamResponse.json();
        return NextResponse.json(
          { error: err.error?.message || `Groq error: ${streamResponse.status}` },
          { status: streamResponse.status },
        );
      }
      
      // Stream the response directly
      const reader = streamResponse.body?.getReader();
      if (!reader) {
        return NextResponse.json(
          { error: "No response body from Groq API" },
          { status: 500 },
        );
      }
      
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              controller.enqueue(encoder.encode(decoder.decode(value, { stream: true })));
            }
          } catch (error) {
            console.error("Streaming error:", error);
            const errorResponse = `data: ${JSON.stringify({
              choices: [{
                delta: {
                  content: "I encountered an error while generating my response. Please try again."
                }
              }]
            })}\n\n`;
            controller.enqueue(encoder.encode(errorResponse));
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
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
