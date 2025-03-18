import { NextRequest, NextResponse } from 'next/server';


export const progressState = {
  total: 0,
  completed: 0,
  percentage: 0,
};

export function GET(req: NextRequest) {
  // Create a Server-Sent Events response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial progress
      const initialData = `data: ${JSON.stringify(progressState)}\n\nevent: progress\n`;
      controller.enqueue(encoder.encode(initialData));
      
      // Keep the connection alive
      const interval = setInterval(() => {
        if (progressState.completed >= progressState.total && progressState.total > 0) {
          clearInterval(interval);
          controller.close();
        } else {
          const data = `data: ${JSON.stringify(progressState)}\n\nevent: progress\n`;
          controller.enqueue(encoder.encode(data));
        }
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    }
  });
}

// Helper function to update progress
export function updateProgress(completed: number, total: number) {
  progressState.completed = completed;
  progressState.total = total;
  progressState.percentage = total > 0 ? (completed / total) * 100 : 0;
}