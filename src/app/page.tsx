'use client';

import {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import {callApi, ApiRequest} from '@/services/api-caller';
import {summarizeDifferences} from '@/ai/flows/summarize-differences';
import {suggestFixes} from '@/ai/flows/suggest-fixes';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useToast} from "@/hooks/use-toast"
import {toast} from "@/hooks/use-toast"
import {cn} from "@/lib/utils";
import {HistoryTable} from "@/components/history-table";
import {Icons} from "@/components/icons";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";

// Importa react-json-editor-ajrm dinámicamente para evitar problemas con SSR
const JSONInput = dynamic(() => import('react-json-editor-ajrm'), { ssr: false });

interface RequestFormProps {
  url: string;
  method: 'GET' | 'POST';
  data: string;
  onChange: (field: string, value: string) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ url, method, data, onChange }) => {
  const handleJsonChange = (content: any) => {
    if (!content.error) {
      onChange('data', JSON.stringify(content.jsObject, null, 2));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => onChange('url', e.target.value)}
          placeholder="https://example.com/api"
        />
      </div>
      <div>
        <Label htmlFor="method">Method</Label>
        <Select value={method} onValueChange={(value) => onChange('method', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="data">Data</Label>
        <div className="border rounded-md p-2 bg-gray-50">
          <JSONInput
            id="data"
            placeholder={data ? JSON.parse(data) : {}}
            onChange={handleJsonChange}
            theme="light_mitsuketa_tribute"
            locale="en"
            height="200px"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [request1, setRequest1] = useState<ApiRequest>({url: '', method: 'GET', data: ''});
  const [request2, setRequest2] = useState<ApiRequest>({url: '', method: 'GET', data: ''});
  const [response1, setResponse1] = useState<any>(null);
  const [response2, setResponse2] = useState<any>(null);
  const [differences, setDifferences] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [history, setHistory] = useState<ApiRequest[]>([]);
  const { toast } = useToast()
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<ApiRequest | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);

  useEffect(() => {
    const storedHistory = localStorage.getItem('requestHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('requestHistory', JSON.stringify(history));
  }, [history]);

  const handleFormChange = (formId: 1 | 2, field: string, value: string) => {
    const updateRequest = (formId === 1) ? setRequest1 : setRequest2;
    updateRequest((prevState: ApiRequest) => ({...prevState, [field]: value}));
  };

  const fetchData = async () => {
    try {
      const res1 = await callApi(request1);
      const res2 = await callApi(request2);

      setResponse1(JSON.stringify(res1, null, 2));
      setResponse2(JSON.stringify(res2, null, 2));

      const diffSummary = await summarizeDifferences({response1: res1, response2: res2});
      setDifferences(diffSummary?.summary || 'No significant differences found.');

      const fixSuggestions = await suggestFixes({
        json1: JSON.stringify(res1, null, 2),
        json2: JSON.stringify(res2, null, 2),
        differences: diffSummary?.summary || 'No significant differences found.',
      });
      setSuggestions(fixSuggestions?.suggestions || 'No suggestions available.');

      setHistory((prevHistory) => {
        const newHistory = [...prevHistory, request1, request2];
        return newHistory.slice(-5); // Limit history to the last 5 entries
      });

      toast({
        title: "Data fetched and differences analyzed!",
        description: "Check the results below.",
      })
    } catch (error: any) {
      console.error('Error fetching data or analyzing differences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch data or analyze differences: ${error.message}`,
      })
    }
  };

  const handleDeleteHistoryEntry = () => {
    if (selectedHistoryEntry) {
      setHistory((prevHistory) =>
        prevHistory.filter((entry) => entry !== selectedHistoryEntry)
      );
      setSelectedHistoryEntry(null); // Clear the selected entry after deletion
      setOpenAlertDialog(false); // Close the alert dialog
    }
  };

  const handleLoadHistoryEntry = (entry: ApiRequest) => {
    setRequest1(entry);
    setRequest2({url: '', method: 'GET', data: ''});
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Diff Detective</CardTitle>
          <CardDescription>
            Enter two API endpoints to compare their JSON responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RequestForm
            url={request1.url}
            method={request1.method}
            data={request1.data}
            onChange={(field, value) => handleFormChange(1, field, value)}
          />
          <RequestForm
            url={request2.url}
            method={request2.method}
            data={request2.data}
            onChange={(field, value) => handleFormChange(2, field, value)}
          />
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Button onClick={fetchData}>
          <Icons.share className="mr-2 h-4 w-4"/>
          Compare
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Response 1</CardTitle>
            <CardDescription>
              JSON response from {request1.url || 'URL 1'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <pre className="font-mono text-sm">
                {response1 || 'No response yet.'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response 2</CardTitle>
            <CardDescription>
              JSON response from {request2.url || 'URL 2'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <pre className="font-mono text-sm">
                {response2 || 'No response yet.'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Differences Summary</CardTitle>
          <CardDescription>
            Summary of the key differences between the two responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <p>{differences}</p>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
          <CardDescription>
            Suggestions for fixes or reasons for the discrepancies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <p>{suggestions}</p>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            History of the input URLs and data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryTable
            history={history}
            onLoad={handleLoadHistoryEntry}
            onDelete={(entry) => {
              setSelectedHistoryEntry(entry);
              setOpenAlertDialog(true);
            }}
          />
          <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteHistoryEntry}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
