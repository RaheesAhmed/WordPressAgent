'use client';

import { Suspense } from 'react';
import { ChatInterface } from './ChatInterface';

function ChatInterfaceFallback() {
  return (
    <div className="flex w-full h-screen bg-gradient-bg overflow-hidden">
      <div className="w-16 bg-sidebar border-r border-sidebar-border" />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    </div>
  );
}

export function ChatInterfaceWrapper() {
  return (
    <Suspense fallback={<ChatInterfaceFallback />}>
      <ChatInterface />
    </Suspense>
  );
}