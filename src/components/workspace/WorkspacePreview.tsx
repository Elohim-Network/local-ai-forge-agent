
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WorkspacePreview() {
  return (
    <div className="h-full border-l border-border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Preview</h3>
        <Select defaultValue="mobile">
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Preview mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-background rounded-lg border border-border h-[calc(100%-3rem)] p-4 flex items-center justify-center">
        <div className="w-full max-w-sm h-[520px] bg-card rounded-lg overflow-hidden">
          <div className="h-12 border-b border-border flex items-center px-4">
            <span className="text-sm font-medium">Customer Support</span>
          </div>
          <div className="h-[calc(100%-6rem)] p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-muted/50 p-2 rounded-lg max-w-[80%] ml-auto">
                <p className="text-sm">Hi, I'm having trouble canceling my subscription.</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg max-w-[80%]">
                <p className="text-sm">I'm sorry to hear that you're having issues. I'd be happy to help you cancel your subscription. Could you please tell me which plan you're currently subscribed to?</p>
              </div>
            </div>
          </div>
          <div className="h-12 border-t border-border p-2 flex items-center gap-2">
            <input 
              className="flex-1 bg-muted/50 border-none text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" 
              placeholder="Type your message..."
            />
            <Button size="sm" className="h-8 w-8 p-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
