import 'dotenv/config';

async function testGroqAPI() {
    console.log('Testing Groq API...');
    console.log('API Key:', process.env.GROQ_API_KEY ? '✓ Found' : '✗ Missing');

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say hello' }],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('✗ API Error:', response.status, error);
            return;
        }

        const data = await response.json();
        console.log('✓ API Response:', data.choices[0].message.content);
    } catch (error) {
        console.error('✗ Request failed:', error.message);
    }
}

testGroqAPI();
