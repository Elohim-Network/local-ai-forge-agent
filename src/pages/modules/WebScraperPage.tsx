
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SearchCheck, Link, Download, AlertCircle, Table, Database, FileSpreadsheet, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WebScraperPage = () => {
  const [url, setUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<string | null>(null);
  
  const handleScrapeUrl = () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scrape.",
        variant: "destructive"
      });
      return;
    }
    
    setIsScraping(true);
    setScrapedData(null);
    
    // Simulate scraping process
    setTimeout(() => {
      setIsScraping(false);
      setScrapedData("Sample scraped data from " + url);
      
      toast({
        title: "Scraping Complete",
        description: "Web page content has been successfully scraped.",
      });
    }, 2000);
  };
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Web Scraper</h1>
          <p className="text-muted-foreground">Extract data from websites automatically</p>
        </div>
      </div>
      
      <Tabs defaultValue="scraper" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="scraper">Scraper</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scraper" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Web Scraper</CardTitle>
              <CardDescription>Enter a URL to scrape data from a website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL to Scrape</Label>
                <div className="flex gap-2">
                  <Input 
                    id="url" 
                    placeholder="https://example.com" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleScrapeUrl} 
                    disabled={isScraping || !url}
                    className="gap-2"
                  >
                    {isScraping ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Scraping...
                      </>
                    ) : (
                      <>
                        <SearchCheck size={16} />
                        Scrape
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="follow-links" className="cursor-pointer">
                      Follow Links
                    </Label>
                    <Switch id="follow-links" />
                  </div>
                  <p className="text-xs text-muted-foreground">Follow and scrape linked pages</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="extract-images" className="cursor-pointer">
                      Extract Images
                    </Label>
                    <Switch id="extract-images" />
                  </div>
                  <p className="text-xs text-muted-foreground">Download images from the page</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="css-selector">CSS Selector (Optional)</Label>
                <Input 
                  id="css-selector" 
                  placeholder=".article-content, #main-content" 
                />
                <p className="text-xs text-muted-foreground">
                  Target specific elements with CSS selectors
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Extracted Data</CardTitle>
              <CardDescription>View and analyze scraped content</CardDescription>
            </CardHeader>
            <CardContent>
              {scrapedData ? (
                <Textarea 
                  value={scrapedData} 
                  readOnly 
                  className="min-h-[200px]" 
                />
              ) : (
                <div className="min-h-[200px] flex items-center justify-center border rounded-md text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle size={24} className="mx-auto mb-2" />
                    <p>No data scraped yet. Enter a URL and click "Scrape" to begin.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-2" disabled={!scrapedData}>
                <ImageIcon size={16} />
                View Images
              </Button>
              <div className="space-x-2">
                <Button variant="outline" className="gap-2" disabled={!scrapedData}>
                  <Table size={16} />
                  View as Table
                </Button>
                <Button className="gap-2" disabled={!scrapedData}>
                  <Download size={16} />
                  Export Data
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your scraped datasets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-8 text-center">
                <Database size={32} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Datasets Available</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't saved any scraped data yet. Use the scraper to gather data from websites.
                </p>
                <Button variant="outline">Create New Dataset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scraper Settings</CardTitle>
              <CardDescription>Configure how the web scraper behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-delay">Request Delay (ms)</Label>
                    <Input 
                      id="request-delay" 
                      type="number" 
                      defaultValue="1000" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Delay between requests to avoid rate limiting
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-depth">Maximum Link Depth</Label>
                    <Input 
                      id="max-depth" 
                      type="number" 
                      defaultValue="2" 
                    />
                    <p className="text-xs text-muted-foreground">
                      How many levels of links to follow
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-agent">User Agent</Label>
                    <Input 
                      id="user-agent" 
                      defaultValue="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="javascript" className="cursor-pointer">
                          Execute JavaScript
                        </Label>
                        <Switch id="javascript" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cookies" className="cursor-pointer">
                          Accept Cookies
                        </Label>
                        <Switch id="cookies" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="proxy" className="cursor-pointer">
                          Use Proxy
                        </Label>
                        <Switch id="proxy" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="respect-robots" className="cursor-pointer">
                          Respect robots.txt
                        </Label>
                        <Switch id="respect-robots" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="export-format">Default Export Format</Label>
                    <select 
                      id="export-format" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="csv"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="html">HTML</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebScraperPage;
