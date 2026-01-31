const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent('Say hello in 5 words');
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Gemini API works!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Status:', error.status);
  }
}

testGemini();
