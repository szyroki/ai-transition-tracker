# AI Implementation Transition Tracker

A personal learning dashboard tracking my 6-month transition into AI implementation work. Built for my own use — not designed to be reused or adapted by others.

## What it is

A structured tracker covering six monthly focuses: Python scripting, API/key management, Microsoft 365 & Copilot, RAG systems, evaluation frameworks, and portfolio packaging. Includes a task checklist, notes, resource links, and an interview answer bank.

## Why it's public

Shared for transparency, not as a template. The content (months, tasks, resources) is hardcoded for my specific learning plan and not configurable.

## Stack

React + Vite + Tailwind CSS, deployed at [ai-transition-tracker.netlify.app](https://ai-transition-tracker.netlify.app). Progress syncs across devices via Firebase Firestore with Google Sign-In.

## Firebase rules

The app expects Firestore data to be private per signed-in user:

```js
match /users/{userId}/data/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
