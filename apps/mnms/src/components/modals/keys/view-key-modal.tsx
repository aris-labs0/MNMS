import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CopyIcon, CheckIcon, EyeIcon } from 'lucide-react'
import {env} from "@/env"
interface ViewTokenModalProps {
  token: string;
}

export default function ViewTokenModal({ token }: ViewTokenModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);


  const ACCES_KEY = `${env.NEXT_PUBLIC_BACKEND_URL}/${token}`

  const tokenSnippet = `/tool/fetch url=${ACCES_KEY} /dst-path=onboarding.rsc\n/import onboarding.rsc`;

  const copyToClipboard = async () => {
    try {
      setCopyError(null);
      await navigator.clipboard.writeText(tokenSnippet);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      setCopyError("Failed to copy to clipboard. Please try again or copy manually.");
      setTimeout(() => setCopyError(null), 3000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items- gap-2"
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Access Key</DialogTitle>
          <DialogDescription>
          Copy and paste this command into your MikroTik terminal.
          </DialogDescription>
        </DialogHeader>
        
        <div>
          <div className="flex items-center justify-end  bg-zinc-100 dark:bg-zinc-800 rounded-t-lg border border-b-0 border-zinc-200 dark:border-zinc-700">
            <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                disabled={isCopied}
                className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                {isCopied ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                    <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="bg-black p-4 rounded-b-lg overflow-x-auto border border-zinc-200 dark:border-zinc-700">
              <pre className="text-sm">
                <code className="font-mono whitespace-pre-wrap break-words text-white">
                  <span className="text-cyan-500">/tool/</span>
                  <span className="text-purple-500">fetch </span>
                  <span className="text-green-500">url</span>
                  <span className="text-yellow-500">=</span>
                  <span className="text-white">{ACCES_KEY}</span>
                  <span className="text-green-500"> dst-path</span>
                  <span className="text-yellow-500">=</span>
                  <span className="text-white">onboarding.rsc</span>
                  <br />
                  <span className="text-cyan-500">/</span>
                  <span className="text-purple-500">import </span>
                  <span className="text-white">onboarding.rsc</span>
                </code>
              </pre>
            </div>
            
            {copyError && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded border border-red-200">
                {copyError}
              </div>
            )}
            
            <div className="mt-4 text-sm text-zinc-500">
              <p>After running these commands, you'll have access to the onboarding resources.</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}