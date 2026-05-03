<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

🚀 CivicGuide AI — Personal Election Navigator

An AI-powered civic assistant that guides users from confusion to confidently casting their vote—step by step.

🧠 Problem

Millions of voters—especially first-time voters—struggle with:

❌ Understanding the election process

❌ Missing registration deadlines

❌ Finding polling locations

❌ Navigating complex government information

💡 Solution

CivicGuide AI transforms elections into a personalized, guided journey using AI + Google Cloud:

👉 Ask: “How do I vote?”

👉 Get: Step-by-step instructions tailored to you

🏆 Why This Stands Out

🧭 Not just information → actionable guidance

🤖 AI-driven personalization

☁️ Fully deployed on Google Cloud

🔥 Real-world impact (civic participation)

☁️ Built Entirely on Google Ecosystem

This project is deeply powered by services from Google Cloud Platform and the broader Google AI stack.

🧠 AI Layer — Gemini (via Google AI Studio)

Using Google AI Studio + Gemini API:

💬 Conversational Q&A

🧭 Personalized voting journey generation

📖 Simplification of complex election concepts

🛡️ Controlled, structured responses

👉 This is the core intelligence engine of the system

🔐 Authentication — Google Auth (Firebase)

Using Firebase Authentication:

One-click Google Sign-In

Secure user identity management

Personalized experience per user

🗄️ Database — Firestore

Using Firestore (Firebase):

Stores:

User profiles

Chat history

Voting journey state

Reminders

👉 Real-time, scalable NoSQL database

🌐 Frontend Hosting — Firebase Hosting

React + Vite app deployed globally

Fast CDN delivery

Instant deployment

☁️ Backend — Cloud Run

FastAPI backend deployed on serverless containers

Auto-scaling (handles zero → thousands of users)

Handles:

AI API calls

business logic

routing

🔄 CI/CD — Cloud Build

Automated deployment pipeline

Triggered on every Git push

git push → Cloud Build → Deploy to Cloud Run

👉 Enables continuous deployment with zero downtime

🗺️ Location Intelligence — Google Maps API

Using Google Maps Platform:

Converts user location → actionable insights

Enables:

Polling booth discovery

Location-based guidance

🔔 Notifications — Firebase Cloud Messaging

Sends:

Deadline alerts

Voting reminders

⚙️ Tech Stack

Frontend

React + TypeScript

Vite + Tailwind

Backend

FastAPI (Python)

Google Stack:

Google Cloud Platform

Firebase

Google Auth

Firestore

Cloud Run

Cloud Build

Google Maps API

AI

Gemini API

Google AI Studio

🚀 Deployment (Google Cloud)

Frontend

cd frontend

npm install

npm run build

firebase deploy

Backend

cd backend

gcloud run deploy civicguide-api \

  --source . \
  
  --region asia-south1 \
  
  --allow-unauthenticated
  
🎯 Key Features

💬 AI Chat Assistant

🧭 Personalized Voting Journey

⏰ Deadline Tracking

📍 Location-based Guidance

🔐 Secure Authentication

🔔 Smart Reminders


📊 Impact

Increases voter awareness

Reduces confusion in election processes

Encourages civic participation

Makes democracy more accessible


🔮 Future Scope

🌍 Multi-country support

🗣️ Voice assistant (regional languages)

📱 Mobile + WhatsApp integration

🔗 Direct voter registration APIs


🎥 Demo / Preview

https://gen-lang-client-0621953563.web.app/

☁️ Built on Google Ecosystem

This project is deeply powered by services from

Google Cloud Platform

🧠 AI — Gemini (Google AI Studio)

Using Google AI Studio:

💬 Conversational assistant

🧭 Personalized voting journey

📖 Simplified explanations

🛡️ Controlled AI responses

🔐 Authentication — Google Auth

Using Firebase Auth:

Google Sign-In

Secure identity

Personalized experience

🗄️ Database — Firestore

Stores:

Users

Chat history

Voting journeys

Reminders

👉 Real-time scalable NoSQL DB

☁️ Backend — Cloud Run

FastAPI backend deployed as container

Auto-scaling serverless infra

Handles AI + APIs

🌐 Frontend — Firebase Hosting

React app deployed globally

Fast CDN delivery

Instant deploy

🔄 CI/CD — Cloud Build

git push → Cloud Build → Deploy → Live 🚀

🗺️ Location — Google Maps API


Using Google Maps Platform:

Polling booth discovery

Location-based guidance

🔔 Notifications — Firebase Cloud Messaging

Deadline reminders

Voting alerts


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/990ccd3c-6b02-4052-b090-d65a26780406

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   🧠 Final Thought

This is not just an AI chatbot.

👉 It’s a cloud-powered civic system built on Google technologies that drives real-world action.

