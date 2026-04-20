# Groq API Key Rotation Guide

This guide ensures the continuous operation of the AI-powered features in Recv. AI by providing instructions on how to rotate the Groq API key before it expires.

## 🕒 Expiration Overview
Groq API keys occasionally expire for security reasons. You will typically receive an email notification 7 days before the key expires.

## 🚀 Step 1: Generate a New Key
1.  Log in to the [Groq Cloud Console](https://console.groq.com/keys).
2.  Click the **"Create API Key"** button.
3.  Name the key for easy identification (e.g., `ReCV-PROD-2026`).
4.  **Copy the key immediately**. You will not be able to see it again once you close the modal.

## 💻 Step 2: Update Local Development
To test the new key locally before deploying:
1.  Open your [`.env.local`] file.
2.  Replace the value of `GROQ_API_KEY` with your new key:
    ```env
    GROQ_API_KEY=gsk_your_new_key_here
    ```
3.  Restart your development server (`npm run dev`).
4.  Test an AI feature (e.g., "Analyze CV") to ensure it still works.

## 🌐 Step 3: Update Production (Vercel)
1.  Navigate to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select the **`recv-ai`** project.
3.  Go to **Settings** > **Environment Variables**.
4.  Find the `GROQ_API_KEY` entry.
5.  Click the "Edit" button (or the three dots) and paste the new key into the value field.
6.  **Save** the changes.

## 🔄 Step 4: Redploy (Optional but Recommended)
Vercel environment variables usually require a new deployment or a restart of the serverless functions to take effect.
1.  Go to the **Deployments** tab.
2.  Select your latest deployment.
3.  Click **Redeploy** (without cache) to ensure the new environment variable is picked up immediately.

## ✅ Step 5: Verification
1.  Visit the live site at [https://recv-ai.me](https://recv-ai.me).
2.  Log in and trigger an AI-powered refinement or cover letter generation.
3.  If the AI responds correctly, the rotation was successful.

> [!WARNING]
> Never commit your API keys to version control. Ensure `GROQ_API_KEY` is always managed via `.env` files or the Vercel dashboard.
