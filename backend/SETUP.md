# 🏦 Noel Backend Setup - Live Plaid Integration

## Quick Start (Local Testing)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create `.env` file
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Your credentials are already in `.env.example`:
- `PLAID_CLIENT_ID=69fb424d74a76c000dbf0301`
- `PLAID_SECRET=7d001e332e2a3abb5620180c1a373e`

### 3. Start the Server
```bash
npm start
```

You should see:
```
🏦 Noel Backend running on port 3001
```

### 4. Test Locally
- Open warm layout: `http://localhost:5000/warm/app.html`
- Go to Settings → Click "Connect Bank Account"
- Select your Irish bank (AIB, Bank of Ireland, etc.)
- Authorize the connection
- Transactions will auto-import!

---

## Deploy to Production

### Option 1: Railway (Recommended - Free Tier)
1. Go to https://railway.app
2. Create account
3. Create new project from GitHub
4. Connect your `noels-project` repo
5. Add environment variables in Railway dashboard:
   - `PLAID_CLIENT_ID=69fb424d74a76c000dbf0301`
   - `PLAID_SECRET=7d001e332e2a3abb5620180c1a373e`
6. Set `PORT=8000` in Railway config
7. Deploy!
8. Copy your Railway URL (e.g., `https://noel-backend-prod.railway.app`)

### Option 2: Render (Free Tier)
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub
4. Select `noels-project` repo
5. Set build: `npm install`
6. Set start: `npm start`
7. Add environment variables
8. Deploy!
9. Copy your Render URL

### Option 3: Heroku (Paid)
1. Go to https://heroku.com
2. Create new app
3. Connect GitHub and deploy `noels-project`
4. Add buildpack: `heroku/nodejs`
5. Set environment variables
6. Deploy!

---

## Update Frontend with Your Backend URL

Once deployed, update all 4 layouts:
- `warm/app.html`
- `dark/app.html`
- `clean/app.html`
- `bold/app.html`

Find this line (around line 354):
```javascript
const BACKEND_URL = 'http://localhost:3001';
```

Change to your deployed URL:
```javascript
const BACKEND_URL = 'https://noel-backend-prod.railway.app';
```

---

## Test Real Bank Connection

1. Open your deployed warm layout
2. Settings → Connect Bank Account
3. Select Irish bank:
   - ✅ AIB (Allied Irish Banks)
   - ✅ Bank of Ireland
   - ✅ Revolut
   - ✅ N26
   - ✅ Wise
   - ✅ Ulster Bank
4. Use your real bank credentials
5. Authorize access
6. Last 6 months of transactions will import automatically!

---

## Troubleshooting

### "Backend not running" Error
- Make sure backend server is started: `npm start`
- Check backend is on `http://localhost:3001`
- Check CORS is enabled (it is in server.js)

### "Could not fetch transactions"
- Verify Plaid Client ID and Secret are correct
- Check backend logs for errors
- Make sure you're using production credentials

### Transactions not importing
- Check transaction date is within last 6 months
- Verify Plaid account has access to that bank
- Check backend console for API errors

---

## API Endpoints

All requests go to your backend:

```
POST /api/plaid/create-link-token
→ Returns link_token for Plaid UI

POST /api/plaid/exchange-token
→ Body: { public_token }
→ Returns access_token and item_id

GET /api/plaid/transactions/:itemId
→ Returns last 6 months of transactions
```

---

**Need help?** Check server.js for implementation details or your Plaid docs at https://plaid.com/docs/
