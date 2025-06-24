#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Stonks Environment Setup\n');

const questions = [
  {
    name: 'FINNHUB_API_KEY',
    message: 'Enter your Finnhub API key (get from https://finnhub.io/): ',
    required: true
  },
  {
    name: 'DISCORD_BOT_TOKEN',
    message: 'Enter your Discord bot token (optional, press Enter to skip): ',
    required: false
  },
  {
    name: 'DISCORD_CLIENT_ID',
    message: 'Enter your Discord client ID (optional, press Enter to skip): ',
    required: false
  },
  {
    name: 'PORT',
    message: 'Enter server port (default: 5000): ',
    required: false,
    default: '5000'
  },
  {
    name: 'JWT_SECRET',
    message: 'Enter JWT secret (or press Enter to generate): ',
    required: false
  }
];

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.message, (answer) => {
      if (!answer && question.required) {
        console.log('❌ This field is required!');
        return askQuestion(question).then(resolve);
      }
      resolve(answer || question.default || '');
    });
  });
}

async function setupEnvironment() {
  const envVars = {};
  
  for (const question of questions) {
    const answer = await askQuestion(question);
    envVars[question.name] = answer;
  }
  
  // Generate JWT secret if not provided
  if (!envVars.JWT_SECRET) {
    envVars.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
    console.log('🔑 Generated JWT secret automatically');
  }
  
  // Build .env content
  const envContent = `# Finnhub API Key (Required) - Get from https://finnhub.io/
FINNHUB_API_KEY=${envVars.FINNHUB_API_KEY}

# Discord Bot Configuration
DISCORD_BOT_TOKEN=${envVars.DISCORD_BOT_TOKEN}
DISCORD_CLIENT_ID=${envVars.DISCORD_CLIENT_ID}

# Server Configuration
PORT=${envVars.PORT}
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/stonks

# JWT Secret
JWT_SECRET=${envVars.JWT_SECRET}

# Redis (optional - for caching)
REDIS_URL=redis://localhost:6379

# Email (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Logging
LOG_LEVEL=info
`;
  
  // Write .env file
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Environment file created successfully!');
  console.log('📁 Location:', envPath);
  console.log('\n🔧 Next steps:');
  console.log('1. Install dependencies: npm run install-all');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Open http://localhost:3000 in your browser');
  
  if (!envVars.DISCORD_BOT_TOKEN) {
    console.log('\n🤖 Discord Bot Setup:');
    console.log('1. Go to https://discord.com/developers/applications');
    console.log('2. Create a new application and bot');
    console.log('3. Add DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID to .env');
    console.log('4. Run: npm run bot');
  }
  
  rl.close();
}

setupEnvironment().catch(console.error); 