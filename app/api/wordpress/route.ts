import { NextRequest, NextResponse } from 'next/server';
import { streamWordPressOperations } from '@/lib/agents/wp-agent';

// Configure Vercel function settings
export const maxDuration = 60; // 60 seconds for Pro plan (10s for Hobby)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, thread_id, wordpress_credentials } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate or use provided thread_id
    const threadId = thread_id || `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check for API key: prioritize client-provided, then env
    const anthropicApiKey = wordpress_credentials?.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return NextResponse.json({
        error: 'Anthropic API key not configured. Please add it in WordPress Settings.'
      }, { status: 500 });
    }

    // WordPress credentials: prioritize client-provided (from localStorage), then env
    const wordpressUrl = wordpress_credentials?.url || process.env.WORDPRESS_URL;
    const wordpressUsername = wordpress_credentials?.username || process.env.WORDPRESS_USERNAME;
    const wordpressPassword = wordpress_credentials?.password || process.env.WORDPRESS_APP_PASSWORD;

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const wpStream = streamWordPressOperations(message, threadId, {
            anthropicApiKey,
            wordpressUrl,
            wordpressUsername,
            wordpressAppPassword: wordpressPassword
          });

          for await (const event of wpStream) {
            // Stream events directly from LangGraph
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
          
          // Send completion signal
          const completionData = { type: 'complete' };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
          
          controller.close();
        } catch (error) {
          const errorEvent = {
            type: 'error',
            content: `Server error: ${(error as Error).message}`
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}