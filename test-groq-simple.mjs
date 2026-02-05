import 'dotenv/config';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroqAPI() {
    console.log('Testing Groq API...');

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say hello in 5 words' }],
                max_tokens: 50
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const error = await response.text();
            console.error('✗ API Error:', error);
            return;
        }

        const data = await response.json();
        console.log('✓ Success! AI said:', data.choices[0].message.content);
    } catch (error) {
        console.error('✗ Request failed:', error.message);
    }
}

testGroqAPI();
