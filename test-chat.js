// const fetch = require('node-fetch'); // Native fetch in Node 18+

async function testChat() {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            const text = await response.text();
            console.error('Response body:', text);
            return;
        }

        console.log('Response OK');
        // Consume stream
        for await (const chunk of response.body) {
            console.log('Received chunk:', chunk.toString());
            break; // Just check if we get something
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testChat();
