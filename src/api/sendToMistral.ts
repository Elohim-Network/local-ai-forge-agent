
export async function sendToMistralStream(prompt: string, onToken: (token: string) => void): Promise<void> {
  const controller = new AbortController();

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
    signal: controller.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to connect to Mistral");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let partial = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    partial += decoder.decode(value, { stream: true });

    const tokens = partial.split("\n");
    for (let i = 0; i < tokens.length - 1; i++) {
      try {
        const parsed = JSON.parse(tokens[i]);
        if (parsed?.choices?.[0]?.delta?.content) {
          onToken(parsed.choices[0].delta.content);
        }
      } catch (err) {
        continue; // skip incomplete JSON
      }
    }

    partial = tokens[tokens.length - 1];
  }

  reader.releaseLock();
  controller.abort();
}
