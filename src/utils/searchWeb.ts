export async function searchWeb({ query }: { query: string }) {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    return JSON.stringify({
      error: "Search API key is not configured",
      results: []
    });
  }

  if (!query || query.trim().length === 0) {
    return JSON.stringify({
      error: "Search query is required",
      results: []
    });
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        query: query.trim(),
        auto_parameters: true,
        search_depth: "basic",
        include_answer: true,
        include_raw_content: false,
        max_results: 8
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Search API error: ${res.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await res.json();
    
    // Format the response for better LLM consumption
    const formattedResponse = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
      results: data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content?.substring(0, 500) || "", // Limit content length
        published_date: result.published_date
      })) || [],
      answer: data.answer || null,
      hasResults: (data.results?.length || 0) > 0
    };

    return JSON.stringify(formattedResponse);
    
  } catch (error) {
    console.error("SearchWeb error:", error);
    
    return JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown search error",
      query: query.trim(),
      results: [],
      hasResults: false
    });
  }
}
