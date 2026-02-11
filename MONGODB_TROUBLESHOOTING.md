# MongoDB Connection Troubleshooting Guide

## Current Issue
The app is timing out at 30 seconds with error: `tlsv1 alert internal error` when connecting to MongoDB Atlas.

## Root Cause
The MongoDB Atlas cluster at `cluster0.csjlaiv.mongodb.net` is rejecting the TLS handshake. This is NOT a Prisma issue - it's a database connectivity problem.

## Solutions to Try (in order)

### 1. Check MongoDB Atlas IP Whitelist
- Go to: MongoDB Atlas Dashboard → Your Cluster → Network Access
- **Current status**: Check if your IP or 0.0.0.0/0 is whitelisted
- **Fix**: Add your IP or use 0.0.0.0/0 for development (testing only)

### 2. Verify Credentials
The connection string contains encoded special characters:
- `%2A` = `*`
- `%23` = `#`

```
Current: mongodb+srv://konnie:%2Adishimwe930%23@cluster0.csjlaiv.mongodb.net/typing-auth
Decoded: mongodb+srv://konnie:*dishimwe930#@cluster0.csjlaiv.mongodb.net/typing-auth
```

**Verify** that `*dishimwe930#` is the correct password in MongoDB Atlas.

### 3. Check MongoDB Atlas Cluster Status
- Go to: MongoDB Atlas Dashboard → Cluster Overview
- Look for any warnings or maintenance notices
- Ensure the cluster is **"Running"** (green status)

### 4. Update .env.local Connection String
If credentials look wrong, update to use the correct password from MongoDB:

```
DATABASE_URL="mongodb+srv://[username]:[password]@cluster0.csjlaiv.mongodb.net/typing-auth?appName=Cluster0&retryWrites=true&w=majority"
```

### 5. Reset Connection String in MongoDB Atlas
- Click "Connect" button on your cluster
- Select "Drivers" → "Nodejs"
- Copy the connection string exactly as shown
- Replace the DATABASE_URL in `.env.local`

## What We Already Fixed
✓ Prisma client pooling (all API routes now use singleton)
✓ Prisma client generation issues
✓ Production environment variable handling

## Current Performance Status
**Before MongoDB is working:**
- Login timeouts: 30+ seconds ✗
- Dashboard load: Cannot load ✗

**After MongoDB is fixed:**
- Login: Should be <500ms
- Dashboard: Should be <200ms

## Testing Connection
Run this command to test directly:
```bash
node test-db-connection.js
```

If it succeeds, restart the dev server:
```bash
npm run dev
```
