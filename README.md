# 📈 Stonks - Live Market Data & AI Trading Signals

A comprehensive stocks application that provides real-time market data and AI-powered trading signals to help you make informed investment decisions. Now with a standalone Discord bot that works in DMs and any server!

## 🚀 Features

### 📊 Live Market Data
- Real-time stock prices from Finnhub API
- Historical data and interactive charts
- Market indices and sector performance
- News and market sentiment analysis

### 🤖 AI-Powered Trading Signals
- Machine learning algorithms analyze market patterns
- Buy/Sell recommendations based on technical indicators
- Risk assessment and portfolio optimization
- Market trend predictions

### 📱 Cross-Platform Support
- Responsive web application
- Mobile-optimized interface
- Real-time updates via WebSocket
- Offline capability for basic features
- **Cloudflare Tunneling Support** - Works seamlessly with Cloudflare tunnels

### 🎮 Standalone Discord Bot Application
- **Global Commands**: Use slash commands in DMs or any server
- **Private Responses**: All bot responses are private (ephemeral)
- **No Server Invite Required**: Works anywhere without setup
- **Real-time DMs**: Get instant stock updates and alerts
- **Portfolio Tracking**: Monitor your investments through Discord
- **Price Alerts**: Set up notifications for specific price targets
- **Market News**: Receive breaking market news and updates

### 📈 Technical Analysis
- Multiple technical indicators (RSI, MACD, Moving Averages)
- Chart patterns recognition
- Volume analysis
- Support and resistance levels

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **Discord.js** for bot integration
- **Finnhub API** for market data
- **Technical Indicators** library for market analysis
- **Machine Learning** algorithms for predictions
- **Cron Jobs** for scheduled data updates

### Frontend
- **React.js** with TypeScript
- **Chart.js** for interactive charts
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time updates
- **PWA** capabilities for mobile experience

### Data Sources
- **Finnhub API** for real-time market data
- **News APIs** for market sentiment

## 🎮 Discord Bot Commands

### Stock Information
- `/stonks <symbol>` - Get current stock price and info
- `/signals <symbol>` - Get AI trading signals
- `/chart <symbol> <timeframe>` - Get stock chart data

### Portfolio Management
- `/portfolio` - View your portfolio
- `/add <symbol> <shares> <price>` - Add stock to portfolio
- `/remove <symbol>` - Remove stock from portfolio

### Market Data
- `/market` - Get market overview
- `/indices` - Check major market indices
- `/news [symbol]` - Get latest market news

### Alerts & Notifications
- `/alert <symbol> <price> <above/below>` - Set price alert
- `/alerts` - View your active alerts
- `/remove-alert <id>` - Remove an alert

### Help & Info
- `/help` - Show available commands
- `/about` - About Stonks Bot

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Discord Bot Token (see Discord Bot Setup)
- Finnhub API key (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stonks
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   copy env.example .env
   # Edit .env with your API keys and Discord bot token
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the Discord bot**
   ```bash
   npm run bot
   ```

6. **Open your browser**
   - Web app: http://localhost:3000
   - API server: http://localhost:5000

## 🌐 Cloudflare Tunneling Support

The application is now optimized for Cloudflare tunneling with:

- **Enhanced CORS Configuration**: Supports Cloudflare tunnel domains
- **WebSocket Compatibility**: Works with Cloudflare's WebSocket proxy
- **Error Handling**: Better error messages for tunnel-related issues
- **Request Logging**: Detailed logging for debugging tunnel connections

### Using with Cloudflare Tunnel

1. **Install Cloudflare Tunnel**
   ```bash
   npm install -g cloudflared
   ```

2. **Create a tunnel**
   ```bash
   cloudflared tunnel create stonks-app
   ```

3. **Configure the tunnel**
   ```bash
   cloudflared tunnel route dns stonks-app your-domain.com
   ```

4. **Start the tunnel**
   ```bash
   cloudflared tunnel run stonks-app
   ```

The application will automatically detect and work with Cloudflare tunnel domains.

## 🤖 Discord Bot Setup

### 1. Create a Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Stonks Bot")
4. Go to "Bot" section and create a bot
5. Copy the bot token

### 2. Set Bot Permissions
- Send Messages
- Use Slash Commands
- Send Messages in Threads
- Embed Links
- Attach Files
- Read Message History

### 3. Run Setup Script (Windows)
```bash
setup-discord-bot.bat
```

### 4. Register Global Commands
The bot will automatically register global slash commands when it starts.

### 5. Usage
- **In DMs**: Type `/help` to see available commands
- **In any server**: Use commands like `/stonks AAPL` or `/market`
- **All responses are private**: Only you can see the bot's responses

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Finnhub API Key (Required)
FINNHUB_API_KEY=your_finnhub_api_key

# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database (optional)
MONGODB_URI=your_mongodb_uri

# JWT Secret
JWT_SECRET=your_jwt_secret

# Redis (optional - for caching)
REDIS_URL=your_redis_connection_string

# Email (optional - for notifications)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### Getting a Finnhub API Key

1. Go to [Finnhub.io](https://finnhub.io/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

**Note**: The free tier includes 60 API calls per minute, which is sufficient for most use cases.

## 📱 Mobile App

The web application is fully responsive and works as a Progressive Web App (PWA). Users can:
- Add to home screen on mobile devices
- Receive push notifications for price alerts
- Use offline for basic features
- Get Discord notifications on mobile

## 🤖 AI Trading Signals

The app uses several machine learning models to generate trading signals:

1. **Technical Analysis Model**
   - Analyzes price patterns and volume
   - Identifies support/resistance levels
   - Calculates momentum indicators

2. **Sentiment Analysis Model**
   - Processes news and social media sentiment
   - Correlates sentiment with price movements
   - Provides market mood indicators

3. **Pattern Recognition Model**
   - Identifies chart patterns (head & shoulders, triangles, etc.)
   - Predicts potential breakout/downside moves
   - Historical pattern success rate analysis

## 📊 API Endpoints

### Market Data
- `GET /api/stocks/:symbol` - Get current stock data
- `GET /api/stocks/:symbol/history` - Get historical data
- `GET /api/stocks/market/indices` - Get market indices
- `GET /api/stocks/:symbol/news` - Get company news

### Trading Signals
- `GET /api/signals/:symbol` - Get AI trading signals
- `GET /api/signals/portfolio` - Get portfolio recommendations
- `POST /api/signals/analyze` - Analyze custom stock list

### User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/portfolio` - Get user portfolio
- `POST /api/user/watchlist` - Manage watchlist

### Discord Bot
- `POST /api/discord/webhook` - Discord webhook endpoint
- `GET /api/discord/commands` - Get available commands
- `GET /api/discord/status` - Get bot status

## 🔒 Security Features

- JWT authentication
- Rate limiting
- Input validation
- CORS protection with Cloudflare tunnel support
- Helmet.js security headers
- API key encryption
- Discord bot token security
- Private/ephemeral bot responses

## 📈 Performance Optimization

- Redis caching for frequently accessed data
- Database indexing for fast queries
- Image optimization
- Code splitting and lazy loading
- CDN integration for static assets
- Discord bot command caching
- Finnhub API rate limiting compliance

## 🌍 Discord Bot Features

### Standalone Application
- **Global Commands**: Works in DMs and any server
- **Private Responses**: All responses are ephemeral (only you see them)
- **No Setup Required**: No need to invite bot to servers
- **Cross-Server**: Use commands in any server you're in
- **DM Support**: Complete privacy in direct messages

### Privacy & Security
- **Ephemeral Responses**: Bot responses are private
- **User-Specific Data**: Portfolios and alerts are user-specific
- **No Server Permissions**: Doesn't need server permissions
- **Secure Storage**: Data stored securely per user

### Real-time Features
- **Price Alerts**: Get DM notifications when targets are hit
- **Portfolio Updates**: Track your investments privately
- **Market News**: Receive breaking news updates
- **AI Signals**: Get trading recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. It is not intended to provide financial advice. Always do your own research and consult with a financial advisor before making investment decisions. Past performance does not guarantee future results.

## 🆘 Support

If you encounter any issues or have questions:
- Check the [Issues](https://github.com/your-repo/stonks/issues) page
- Create a new issue with detailed information
- Contact the development team
- Join our Discord server for support

---

**Happy Trading! 📈💰🎮** 