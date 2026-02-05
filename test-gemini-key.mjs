import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testGeminiKey() {
    console.log('Testing Gemini API key...');
    console.log('API Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✓ Found' : '✗ Missing');

    try {
        const result = await streamText({
            model: google('gemini-1.5-flash'),
            messages: [{ role: 'user', content: 'Say hello' }],
        });

        console.log('✓ API call successful!');

        // Read the stream
        for await (const chunk of result.textStream) {
            process.stdout.write(chunk);
        }
        console.log('\n✓ Stream completed successfully!');
    } catch (error) {
        console.error('✗ API call failed:', error);
    }
}

testGeminiKey();
