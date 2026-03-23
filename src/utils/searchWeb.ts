export async function searchWeb({ query }: { query: string }) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, auto_parameters: true }),
  });

  return JSON.stringify(await res.json());
}
