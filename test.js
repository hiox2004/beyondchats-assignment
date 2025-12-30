const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    console.log('✅ Gemini 2.5 Flash is working!');
    console.log('Response:', response.text());
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
