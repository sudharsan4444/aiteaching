# AI Teaching Assistant - API Key Guide

To get the application running, you need to set up several API keys. Follow this guide to find them and paste them into your project.

## 1. Google Gemini API (Required for AI features)
- **Where to find**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Steps**:
  1. Click on **"Get API key"**.
  2. Copy the key.
- **Where to paste**:
  - In `backend/.env`: `GEMINI_API_KEY=your_key_here`
  - In `frontend/.env.local`: `GEMINI_API_KEY=your_key_here`

## 2. MongoDB URI (Required for Database)
- **Where to find**: Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Steps**:
  1. Go to your cluster.
  2. Click **"Connect"**.
  3. Choose **"Drivers"**.
  4. Copy the connection string (looks like `mongodb+srv://...`).
  5. Replace `<password>` with your database user's password.
- **Where to paste**:
  - In `backend/.env`: `MONGODB_URI=your_connection_string_here`

## 3. Pinecone API (Required for Materials Search)
- **Where to find**: Go to [Pinecone Console](https://app.pinecone.io/).
- **Steps**:
  1. Create a project and an index (e.g., named `ai-teaching-materials`).
  2. Go to **"API Keys"** in the sidebar.
  3. Copy your **API Key** and **Environment** name.
- **Where to paste**:
  - In `backend/.env`:
    ```
    PINECONE_API_KEY=your_key_here
    PINECONE_ENVIRONMENT=your_env_here
    PINECONE_INDEX_NAME=ai-teaching-materials
    ```

## 4. JWT Secret (Required for Login/Security)
- **Where to find**: You create this yourself. It should be a long, random string.
- **Generate one quickly**:
  Run this command in your terminal:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Where to paste**:
  - In `backend/.env`: `JWT_SECRET=your_generated_random_string`

---

## Final Step: Initialize Environment Files
I have prepared the files for you. Make sure you rename `backend/.env.example` to `backend/.env` if you haven't already.
