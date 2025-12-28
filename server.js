const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment Variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_PERMISSION_CHAT_ID = process.env.TELEGRAM_PERMISSION_CHAT_ID;
const TELEGRAM_PERFORMANCE_CHAT_ID = process.env.TELEGRAM_PERFORMANCE_CHAT_ID;

// MongoDB Connection
let db;
let accountsCollection;

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('ea-cloud');
    accountsCollection = db.collection('accounts');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Telegram Bot
let bot;
if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
  console.log('✅ Telegram Bot initialized');
} else {
  console.warn('⚠️  Telegram Bot Token not provided');
}

// Send Telegram Message
async function sendTelegramMessage(chatId, message) {
  if (!bot || !chatId) {
    console.log('📱 Telegram not configured, skipping notification');
    return;
  }
  
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Telegram error:', error.message);
  }
}

// ==================== ROUTES ====================

// Root - Health Check
app.get('/', (req, res) => {
  res.json({
    message: 'EA Cloud Backend API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register Account
app.post('/api/register', async (req, res) => {
  try {
    const { ea_type, account, broker, name, phone, reason } = req.body;
    
    console.log('📥 Registration request:', { ea_type, account, broker, name });
    
    // Validate required fields
    if (!ea_type || !account || !broker || !name || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['ea_type', 'account', 'broker', 'name', 'phone']
      });
    }
    
    // Check if account already exists
    const existing = await accountsCollection.findOne({ ea_type, account: String(account) });
    
    if (existing) {
      console.log('ℹ️  Account already registered');
      return res.status(409).json({ 
        message: 'Account already registered',
        status: existing.status,
        enabled: existing.enabled
      });
    }
    
    // Create new account
    const newAccount = {
      ea_type,
      account: String(account),
      broker,
      name,
      phone,
      reason: reason || 'No reason provided',
      status: 'pending',
      enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await accountsCollection.insertOne(newAccount);
    
    // Send Telegram notification
    const telegramMessage = `
🆕 <b>มีคำขออนุมัติใหม่!</b>

<b>EA Type:</b> ${ea_type}
<b>Account:</b> ${account}
<b>Broker:</b> ${broker}
<b>Name:</b> ${name}
<b>Phone:</b> ${phone}
<b>Reason:</b> ${reason || 'ไม่ระบุ'}

<i>กรุณาเข้าไปอนุมัติที่เว็บไซต์</i>
    `.trim();
    
    await sendTelegramMessage(TELEGRAM_PERMISSION_CHAT_ID, telegramMessage);
    
    console.log('✅ Account registered:', account);
    
    res.status(201).json({ 
      message: 'Registration successful',
      account: newAccount.account,
      status: 'pending'
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Accounts by EA Type
app.get('/api/accounts/:ea_type', async (req, res) => {
  try {
    const { ea_type } = req.params;
    
    const accounts = await accountsCollection
      .find({ ea_type })
      .sort({ created_at: -1 })
      .toArray();
    
    res.json({ accounts });
    
  } catch (error) {
    console.error('❌ Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Account Status
app.get('/api/accounts/:ea_type/:account/status', async (req, res) => {
  try {
    const { ea_type, account } = req.params;
    
    const accountData = await accountsCollection.findOne({ 
      ea_type, 
      account: String(account) 
    });
    
    if (!accountData) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({
      account: accountData.account,
      status: accountData.status,
      enabled: accountData.enabled,
      broker: accountData.broker,
      name: accountData.name
    });
    
  } catch (error) {
    console.error('❌ Get status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Account Status
app.put('/api/accounts/:ea_type/:account/status', async (req, res) => {
  try {
    const { ea_type, account } = req.params;
    const { status, enabled } = req.body;
    
    console.log('📝 Update status:', { ea_type, account, status, enabled });
    
    const result = await accountsCollection.updateOne(
      { ea_type, account: String(account) },
      { 
        $set: { 
          status, 
          enabled,
          updated_at: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Get updated account for notification
    const accountData = await accountsCollection.findOne({ ea_type, account: String(account) });
    
    // Send Telegram notification
    let telegramMessage = '';
    
    if (status === 'approved' && enabled) {
      telegramMessage = `
✅ <b>อนุมัติแล้ว!</b>

<b>Account:</b> ${account}
<b>Name:</b> ${accountData.name}
<b>Broker:</b> ${accountData.broker}

<i>EA สามารถเริ่มใช้งานได้แล้ว</i>
      `.trim();
    } else if (status === 'rejected') {
      telegramMessage = `
❌ <b>ปฏิเสธคำขอ</b>

<b>Account:</b> ${account}
<b>Name:</b> ${accountData.name}

<i>คำขอถูกปฏิเสธ</i>
      `.trim();
    } else if (!enabled) {
      telegramMessage = `
🔴 <b>ปิดการใช้งาน EA</b>

<b>Account:</b> ${account}
<b>Name:</b> ${accountData.name}

<i>EA ถูกปิดใช้งาน</i>
      `.trim();
    }
    
    if (telegramMessage) {
      await sendTelegramMessage(TELEGRAM_PERMISSION_CHAT_ID, telegramMessage);
    }
    
    console.log('✅ Status updated');
    
    res.json({ 
      message: 'Status updated',
      status,
      enabled
    });
    
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Account
app.delete('/api/accounts/:ea_type/:account', async (req, res) => {
  try {
    const { ea_type, account } = req.params;
    
    const result = await accountsCollection.deleteOne({ 
      ea_type, 
      account: String(account) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    console.log('🗑️  Account deleted:', account);
    
    res.json({ message: 'Account deleted' });
    
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🚀 EA Cloud Backend Server');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ MongoDB: Connected`);
    console.log(`✅ Telegram: ${bot ? 'Enabled' : 'Disabled'}`);
    console.log('═══════════════════════════════════════');
    console.log('');
  });
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
