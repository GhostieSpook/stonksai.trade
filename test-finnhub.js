#!/usr/bin/env node

require('dotenv').config();
const { getStockData, getHistoricalData, searchStocks } = require('./server/services/stockService');

async function testFinnhubAPI() {
  console.log('🧪 Testing Finnhub API Integration\n');
  
  if (!process.env.FINNHUB_API_KEY) {
    console.error('❌ FINNHUB_API_KEY not found in environment variables');
    console.log('Please run: npm run setup');
    process.exit(1);
  }
  
  console.log('✅ Finnhub API key found');
  
  try {
    // Test 1: Get stock data
    console.log('\n📊 Testing stock data retrieval...');
    const stockData = await getStockData('AAPL');
    if (stockData) {
      console.log('✅ Stock data retrieved successfully');
      console.log(`   Symbol: ${stockData.symbol}`);
      console.log(`   Price: $${stockData.price}`);
      console.log(`   Change: ${stockData.change} (${stockData.changePercent}%)`);
    } else {
      console.log('❌ Failed to retrieve stock data');
    }
    
    // Test 2: Get historical data
    console.log('\n📈 Testing historical data retrieval...');
    const historicalData = await getHistoricalData('AAPL', '1mo', '1d');
    if (historicalData && historicalData.data && historicalData.data.length > 0) {
      console.log('✅ Historical data retrieved successfully');
      console.log(`   Data points: ${historicalData.data.length}`);
      console.log(`   Date range: ${historicalData.data[0].date} to ${historicalData.data[historicalData.data.length - 1].date}`);
    } else {
      console.log('❌ Failed to retrieve historical data');
    }
    
    // Test 3: Search stocks
    console.log('\n🔍 Testing stock search...');
    const searchResults = await searchStocks('Apple');
    if (searchResults && searchResults.length > 0) {
      console.log('✅ Stock search working');
      console.log(`   Found ${searchResults.length} results`);
      console.log(`   First result: ${searchResults[0].symbol} - ${searchResults[0].name}`);
    } else {
      console.log('❌ Failed to search stocks');
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n🚀 You can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Finnhub API key is correct');
    console.log('3. Check if you have exceeded API rate limits');
    console.log('4. Try again in a few minutes');
  }
}

testFinnhubAPI(); 