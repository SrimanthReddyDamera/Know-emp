import { AI_CONTEXT } from '@/lib/ai-context';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        console.log('Raw messages:', JSON.stringify(messages, null, 2));

        // Transform messages to simple {role, content}
        const transformed = messages.map((m: any) => {
            if (m.parts) {
                return { role: m.role, content: m.parts.map((p: any) => p.text || '').join('') };
            }
            return { role: m.role, content: m.content || m.text || '' };
        });
        console.log('Transformed messages:', JSON.stringify(transformed, null, 2));

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: AI_CONTEXT }, ...transformed],
                stream: true
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Groq API error:', err);
            return new Response(JSON.stringify({ error: err }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        // Convert OpenAI streaming format to plain text stream for the client
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';

        const stream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    controller.enqueue(encoder.encode(content));
                                }
                            } catch (e) {
                                console.error('Parse error:', e);
                            }
                        }
                    }
                }
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (err) {
        console.error('API Error:', err);
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
