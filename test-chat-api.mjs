// Direct test of the chat API
const testMessage = {
    messages: [
        { role: 'user', parts: [{ type: 'text', text: 'Say hello in 3 words' }] }
    ]
};

console.log('Testing /api/chat endpoint...');
console.log('Sending:', JSON.stringify(testMessage, null, 2));

fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testMessage)
})
    .then(async response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const error = await response.text();
            console.error('Error response:', error);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            fullResponse += chunk;
            console.log('Chunk received:', chunk);
        }

        console.log('\n=== FULL RESPONSE ===');
        console.log(fullResponse);
    })
    .catch(error => {
        console.error('Request failed:', error);
    });
