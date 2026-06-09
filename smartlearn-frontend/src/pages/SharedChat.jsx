import React from 'react';
import { useParams } from 'react-router-dom';
import { useSharedChat } from '../hooks/useChats';
import { Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Logo from './Logo';

export default function SharedChat() {
  const { shareId } = useParams();
  const { data, isLoading, isError } = useSharedChat(shareId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground flex-col gap-4">
        <AlertCircle size={48} className="text-destructive" />
        <h1 className="text-xl font-semibold">Chat Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This shared link is invalid, has been revoked by the owner, or the chat was deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-4 px-6 flex items-center gap-3">
        <Logo size={24} />
        <div>
          <h1 className="text-sm font-semibold tracking-tight">{data.title}</h1>
          <p className="text-xs text-muted-foreground">
            {data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Shared Chat'}
          </p>
        </div>
        <div className="ml-auto">
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">Public</span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {data.messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' 
                : 'bg-transparent text-foreground'
            }`}>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border mt-auto">
        Powered by SmartLearn AI
      </footer>
    </div>
  );
}
