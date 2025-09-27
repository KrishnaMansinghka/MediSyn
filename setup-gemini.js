#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 Medical Assistant PDF Report Setup');
console.log('=====================================\n');

console.log('This setup will help you configure the Gemini AI API for PDF report generation.\n');

console.log('To get your Gemini API key:');
console.log('1. Go to https://makersuite.google.com/app/apikey');
console.log('2. Sign in with your Google account');
console.log('3. Click "Create API Key"');
console.log('4. Copy the generated API key\n');

rl.question('Enter your Gemini API key: ', (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
        console.log('❌ No API key provided. Setup cancelled.');
        rl.close();
        return;
    }

    // Create .env file
    const envContent = `# Google Cloud Speech-to-Text API
GOOGLE_APPLICATION_CREDENTIALS=/Users/ADMIN/Documents/HACK GT 12/bionic-feat-473314-q6-4a887f343a89.json

# Google Gemini AI API
GEMINI_API_KEY=${apiKey.trim()}

# Server Configuration
PORT=3000
`;

    const envPath = path.join(__dirname, '.env');
    
    try {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created successfully!');
        console.log('✅ Gemini API key configured');
        console.log('\n🚀 You can now start the server with: npm start');
        console.log('📄 PDF report generation will be available in the web interface');
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
        console.log('\nYou can manually create a .env file with:');
        console.log(`GEMINI_API_KEY=${apiKey.trim()}`);
    }
    
    rl.close();
});

rl.on('close', () => {
    console.log('\nSetup complete!');
    process.exit(0);
});
