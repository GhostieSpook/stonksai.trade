@echo off
echo 🤖 Stonks Discord Bot Setup (Standalone Application)
echo ===================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found. Please copy env.example to .env first:
    echo    copy env.example .env
    echo.
    pause
    exit /b 1
)

echo 📋 This script will help you set up your Stonks Discord bot as a standalone application.
echo 🌍 The bot will work in DMs and any server without needing to be invited!
echo.

REM Discord Bot Token
echo 🔑 Step 1: Discord Bot Token
echo 1. Go to https://discord.com/developers/applications
echo 2. Click 'New Application'
echo 3. Give it a name (e.g., 'Stonks Bot')
echo 4. Go to 'Bot' section and click 'Add Bot'
echo 5. Copy the bot token
echo.
set /p BOT_TOKEN="Enter your Discord bot token: "

REM Discord Client ID
echo.
echo 🆔 Step 2: Discord Client ID
echo 1. In the same Discord application, go to 'General Information'
echo 2. Copy the 'Application ID'
echo.
set /p CLIENT_ID="Enter your Discord client ID: "

REM Update .env file
echo.
echo 📝 Updating .env file...

REM Create a temporary file with updated values
powershell -Command "(Get-Content .env) -replace 'DISCORD_BOT_TOKEN=.*', 'DISCORD_BOT_TOKEN=%BOT_TOKEN%' -replace 'DISCORD_CLIENT_ID=.*', 'DISCORD_CLIENT_ID=%CLIENT_ID%' | Set-Content .env"

echo ✅ .env file updated successfully!
echo.

REM Bot permissions
echo 🔐 Step 3: Bot Permissions
echo Your bot needs the following permissions:
echo ✅ Send Messages
echo ✅ Use Slash Commands
echo ✅ Send Messages in Threads
echo ✅ Embed Links
echo ✅ Attach Files
echo ✅ Read Message History
echo.

REM Installation instructions
echo 📦 Step 4: Install Dependencies
echo Run the following command to install Discord.js:
echo npm install
echo.

REM Start instructions
echo 🚀 Step 5: Start the Bot
echo To start your Discord bot, run:
echo npm run bot
echo.
echo To start both the API server and Discord bot:
echo npm run dev
echo.

echo 🎉 Discord bot setup complete!
echo.
echo 🌍 How it works:
echo • The bot registers global slash commands
echo • Commands work in DMs and any server
echo • All responses are private (ephemeral)
echo • No need to invite the bot to servers
echo • Your data stays private
echo.
echo 📚 Next steps:
echo 1. Install dependencies: npm install
echo 2. Start the bot: npm run bot
echo 3. Test commands in DMs: /help, /stonks AAPL, /market
echo 4. Use commands in any server you're in
echo.
echo 💡 Available Commands:
echo • /stonks <symbol> - Get stock info
echo • /signals <symbol> - Get AI signals
echo • /portfolio - View your portfolio
echo • /market - Market overview
echo • /alert <symbol> <price> <above/below> - Set alerts
echo • /help - Show all commands
echo • /about - About the bot
echo.
echo 🔧 Troubleshooting:
echo - Make sure your bot token is correct
echo - Ensure the bot has the required permissions
echo - Check the console for any error messages
echo - Commands may take up to 1 hour to appear globally
echo - Use /help to see if commands are working
echo.
echo 🔒 Privacy Features:
echo - All responses are private (only you can see them)
echo - Works in DMs for complete privacy
echo - No server permissions required
echo - Your portfolio and alerts are private
echo.
pause 