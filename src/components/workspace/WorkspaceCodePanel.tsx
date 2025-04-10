
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WorkspaceCodePanel() {
  return (
    <div className="p-4 h-full">
      <Tabs defaultValue="code" className="h-full flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="flex-1 overflow-auto">
          <div className="bg-card rounded-md p-4 text-sm font-mono h-full overflow-auto">
            <pre className="text-xs text-muted-foreground">
{`import { useEffect, useState } from "react";

// Customer Support Agent component
export default function CustomerSupportAgent() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Connect to local LLM endpoint
  const processMessage = async (message) => {
    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:8000/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-7b-v0.2",
          messages: [
            {
              role: "system",
              content: "You are a helpful customer support agent."
            },
            ...messages,
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I'm having trouble connecting to the AI model.";
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      { role: "user", content: userInput }
    ];
    setMessages(newMessages);
    setUserInput("");
    
    // Process with AI
    const response = await processMessage(userInput);
    setMessages([
      ...newMessages,
      { role: "assistant", content: response }
    ]);
  };

  return (
    // JSX for rendering the chat UI
  );
}`}
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <div className="space-y-4">
            <div className="text-sm">Agent configuration settings will appear here.</div>
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <div className="bg-card rounded-md p-4 h-full overflow-auto">
            <div className="text-xs font-mono space-y-2 text-muted-foreground">
              <div>[12:45:32] Initializing agent...</div>
              <div>[12:45:33] Connecting to Mistral-7B on localhost:8000</div>
              <div>[12:45:34] Connection established successfully</div>
              <div>[12:45:35] Loading knowledge base from /data/support-kb.json</div>
              <div>[12:45:36] Agent ready to process requests</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
