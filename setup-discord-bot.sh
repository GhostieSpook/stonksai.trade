#!/bin/bash

echo "🤖 Stonks Discord Bot Setup"
echo "=========================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env first:"
    echo "   cp env.example .env"
    echo ""
    exit 1
fi

echo "📋 This script will help you set up your Discord bot for Stonks."
echo ""

# Discord Bot Token
echo "🔑 Step 1: Discord Bot Token"
echo "1. Go to https://discord.com/developers/applications"
echo "2. Click 'New Application'"
echo "3. Give it a name (e.g., 'Stonks Bot')"
echo "4. Go to 'Bot' section and click 'Add Bot'"
echo "5. Copy the bot token"
echo ""
read -p "Enter your Discord bot token: " BOT_TOKEN

# Discord Client ID
echo ""
echo "🆔 Step 2: Discord Client ID"
echo "1. In the same Discord application, go to 'General Information'"
echo "2. Copy the 'Application ID'"
echo ""
read -p "Enter your Discord client ID: " CLIENT_ID

# Discord Guild ID (optional)
echo ""
echo "🏠 Step 3: Discord Guild ID (optional)"
echo "1. Enable Developer Mode in Discord (User Settings > Advanced)"
echo "2. Right-click your server and select 'Copy Server ID'"
echo "3. Leave empty if you want global commands"
echo ""
read -p "Enter your Discord guild ID (optional): " GUILD_ID

# Update .env file
echo ""
echo "📝 Updating .env file..."

# Use sed to update the .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/DISCORD_BOT_TOKEN=.*/DISCORD_BOT_TOKEN=$BOT_TOKEN/" .env
    sed -i '' "s/DISCORD_CLIENT_ID=.*/DISCORD_CLIENT_ID=$CLIENT_ID/" .env
    if [ ! -z "$GUILD_ID" ]; then
        sed -i '' "s/DISCORD_GUILD_ID=.*/DISCORD_GUILD_ID=$GUILD_ID/" .env
    fi
else
    # Linux
    sed -i "s/DISCORD_BOT_TOKEN=.*/DISCORD_BOT_TOKEN=$BOT_TOKEN/" .env
    sed -i "s/DISCORD_CLIENT_ID=.*/DISCORD_CLIENT_ID=$CLIENT_ID/" .env
    if [ ! -z "$GUILD_ID" ]; then
        sed -i "s/DISCORD_GUILD_ID=.*/DISCORD_GUILD_ID=$GUILD_ID/" .env
    fi
fi

echo "✅ .env file updated successfully!"
echo ""

# Bot permissions
echo "🔐 Step 4: Bot Permissions"
echo "Your bot needs the following permissions:"
echo "✅ Send Messages"
echo "✅ Use Slash Commands"
echo "✅ Send Messages in Threads"
echo "✅ Embed Links"
echo "✅ Attach Files"
echo "✅ Read Message History"
echo ""

# Invite URL
echo "🔗 Step 5: Invite Bot to Server"
echo "Use this URL to invite your bot to your server:"
echo "https://discord.com/api/oauth2/authorize?client_id=$CLIENT_ID&permissions=2048&scope=bot%20applications.commands"
echo ""

# Installation instructions
echo "📦 Step 6: Install Dependencies"
echo "Run the following command to install Discord.js:"
echo "npm install"
echo ""

# Start instructions
echo "🚀 Step 7: Start the Bot"
echo "To start your Discord bot, run:"
echo "npm run bot"
echo ""
echo "To start both the API server and Discord bot:"
echo "npm run dev"
echo ""

echo "🎉 Discord bot setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Invite the bot to your server using the URL above"
echo "2. Install dependencies: npm install"
echo "3. Start the bot: npm run bot"
echo "4. Test commands like /help, /stock AAPL, /market"
echo ""
echo "💡 Tips:"
echo "- The bot will automatically register slash commands when it starts"
echo "- Use /help to see all available commands"
echo "- Set up price alerts with /alert command"
echo "- Monitor your portfolio with /portfolio command"
echo ""
echo "🔧 Troubleshooting:"
echo "- Make sure your bot token is correct"
echo "- Ensure the bot has the required permissions"
echo "- Check the console for any error messages"
echo "- Restart the bot if commands don't appear"
echo "" 