const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Client, GatewayIntentBits, EmbedBuilder, InteractionResponseType } = require('discord.js');
const { getStockData } = require('../services/stockService');
const { getAITradingSignal } = require('../services/signalService');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once('ready', async () => {
  console.log(`🤖 Stonks Bot is ready! Logged in as ${client.user.tag}`);
  console.log('🌍 Bot is now available in DMs and any server globally');
  console.log('🔒 All responses are private and ephemeral');

  const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!',
    },
    {
      name: 'stock',
      description: 'Get the current price of a stock.',
      options: [
        {
          name: 'symbol',
          type: 3, // STRING
          description: 'The stock symbol (e.g., AAPL)',
          required: true,
        },
      ],
    },
    {
      name: 'signal',
      description: 'Get an AI-powered trading signal for a stock.',
      options: [
        {
          name: 'symbol',
          type: 3, // STRING
          description: 'The stock symbol (e.g., AAPL)',
          required: true,
        },
      ],
    },
    {
      name: 'portfolio',
      description: 'Check your investment portfolio.',
    },
    // Temporary command to clean up bot messages
    {
      name: 'cleanup',
      description: "Deletes the bot's last 100 messages in this DM.",
    },
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('🔄 Registering global slash commands...');
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Global slash commands registered successfully!');
    console.log('🌍 Commands are now available in DMs and any server where you use them');
  } catch (error) {
    console.error('❌ Failed to register global slash commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    if (interaction.commandName === 'ping') {
      await interaction.reply({ 
        content: 'Pong!', 
        flags: 64 // Ephemeral flag
      });
    } else if (interaction.commandName === 'stock') {
      const symbol = interaction.options.getString('symbol').toUpperCase();
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const stockData = await getStockData(symbol);
        if (!stockData) {
          return await interaction.editReply({ 
            content: `Could not fetch data for ${symbol}. Please check the symbol and try again.` 
          });
        }
        
        const stockEmbed = new EmbedBuilder()
          .setColor('#22c55e')
          .setTitle(`Stonks for ${stockData.symbol}`)
          .addFields(
            { name: 'Price', value: `$${stockData.price.toFixed(2)}`, inline: true },
            { name: 'Change', value: `${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)`, inline: true }
          )
          .setTimestamp();
        await interaction.editReply({ embeds: [stockEmbed] });
      } catch (error) {
        await interaction.editReply({ 
          content: `Error fetching stock data for ${symbol}: ${error.message}` 
        });
      }
    } else if (interaction.commandName === 'signal') {
      const symbol = interaction.options.getString('symbol').toUpperCase();
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const signalData = await getAITradingSignal(symbol);
        if (!signalData) {
          return await interaction.editReply({ 
            content: `Could not generate signal for ${symbol}. Please try again.` 
          });
        }
        
        const signalEmbed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle(`AI Signal for ${signalData.symbol}`)
          .addFields(
            { name: 'Signal', value: signalData.signal, inline: true },
            { name: 'Confidence', value: `${(signalData.confidence * 100).toFixed(1)}%`, inline: true },
            { name: 'Reasoning', value: signalData.reasoning, inline: false }
          )
          .setTimestamp();
        await interaction.editReply({ embeds: [signalEmbed] });
      } catch (error) {
        await interaction.editReply({ 
          content: `Error generating signal for ${symbol}: ${error.message}` 
        });
      }
    } else if (interaction.commandName === 'portfolio') {
      const portfolioEmbed = new EmbedBuilder()
        .setColor('#7b2cbf')
        .setTitle('Your Portfolio')
        .setDescription('Here is a summary of your current holdings.')
        .addFields(
          { name: 'Total Value', value: '$12,345.67', inline: true },
          { name: '24h Change', value: '+$234.56 (1.94%)', inline: true },
          { name: 'Top Performer', value: 'TSLA (+5.28%)', inline: false },
          { name: 'Worst Performer', value: 'AAPL (-3.07%)', inline: false }
        )
        .setTimestamp();
      await interaction.reply({ 
        embeds: [portfolioEmbed], 
        flags: 64 // Ephemeral flag
      });
    } else if (interaction.commandName === 'cleanup') {
      // This command should only work in DMs.
      if (interaction.inGuild()) {
        return await interaction.reply({ 
          content: 'This command can only be used in DMs.', 
          flags: 64 // Ephemeral flag
        });
      }
      
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const botMessages = messages.filter(m => m.author.id === client.user.id);
        
        if (botMessages.size === 0) {
          return await interaction.editReply({ 
            content: 'I have no recent messages to delete here.' 
          });
        }
        
        const deletePromises = botMessages.map(msg => msg.delete().catch(err => {
          console.log(`Failed to delete message ${msg.id}:`, err.message);
          return null;
        }));
        
        const results = await Promise.allSettled(deletePromises);
        const successfulDeletes = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
        
        await interaction.editReply({ 
          content: `Successfully deleted ${successfulDeletes} of my previous messages.` 
        });
      } catch (error) {
        console.error('Error during cleanup command:', error);
        await interaction.editReply({ 
          content: 'An error occurred while trying to delete my messages. Please try again later.' 
        });
      }
    }
  } catch (error) {
    console.error('Error processing interaction:', error);
    
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: 'There was an error while executing this command!', 
          flags: 64 // Ephemeral flag
        });
      } else {
        await interaction.reply({ 
          content: 'There was an error while executing this command!', 
          flags: 64 // Ephemeral flag
        });
      }
    } catch (responseError) {
      console.error('Failed to send error response:', responseError);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = { client };