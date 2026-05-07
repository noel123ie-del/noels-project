const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);
const store = {};

app.post('/api/plaid/create-link-token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'user-' + Date.now() },
      client_name: 'Noel Budget Tracker',
      language: 'en',
      products: ['auth', 'transactions'],
      country_codes: ['IE', 'GB', 'EU'],
      institutions: [],
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Link token error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/plaid/exchange-token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    store[itemId] = accessToken;
    res.json({ access_token: accessToken, item_id: itemId });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/plaid/transactions/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const accessToken = store[itemId];

    if (!accessToken) {
      return res.status(400).json({ error: 'Item not found' });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = sixMonthsAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 500,
        offset: 0,
      },
    });

    const transactions = response.data.transactions.map(t => ({
      date: t.date,
      amount: Math.abs(t.amount),
      category: t.personal_finance_category?.primary || t.personal_finance_category || 'Other',
      desc: t.merchant_name || t.name,
      account: t.account_id,
      id: t.transaction_id,
    }));

    res.json({ transactions });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏦 Noel Backend running on port ${PORT}`);
  console.log(`📍 Make sure frontend points to http://localhost:${PORT}`);
});
