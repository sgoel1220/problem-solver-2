# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based "OneClick Problem Solver" application that uses computer vision and AI to solve problems from images. The app requires user authentication, captures images using device camera, and sends them to Google's Gemini 2.0 Flash model for problem-solving.

## Architecture

- **Single-file HTML application**: The entire application is contained in `index.html` with embedded CSS and JavaScript
- **Frontend-only**: No backend server required - runs entirely in the browser
- **Authentication flow**: Basic auth through Google Apps Script API to retrieve Gemini API key
- **Camera API integration**: Uses WebRTC `getUserMedia()` for camera access
- **AI integration**: Connects directly to Google Gemini API from the browser
- **Responsive design**: Grid layout that adapts to mobile and desktop

## Key Components

### Camera System (lines 247-333)
- Supports both front (`user`) and back (`environment`) camera switching
- Handles camera permissions and error states
- Implements mirror effect for front camera display
- Canvas-based image capture for AI processing

### Authentication System (lines 337-379)
- Basic auth login form with username/password
- Calls Google Apps Script API to retrieve Gemini API key
- Stores API key in memory for session duration
- Error handling for failed authentication

### AI Integration (lines 503-543)
- Uses Google Gemini 2.0 Flash model for problem solving
- Sends base64-encoded JPEG images using `inline_data` format
- Configured for concise answer-only responses
- API key retrieved securely through authentication flow

### UI State Management (lines 411-435)
- Loading states with spinner animation
- Success/error message display
- Dynamic button visibility based on camera state

## Development Notes

- **No build system**: This is a static HTML file that can be opened directly in a browser or served via any HTTP server
- **No package manager**: Uses only browser APIs and external API calls
- **Security**: No secrets exposed in code - API key retrieved through secure authentication
- **Browser compatibility**: Requires modern browser support for WebRTC and Canvas APIs

## Running the Application

1. Open `index.html` in a modern web browser
2. Login with valid credentials to retrieve API access
3. Allow camera permissions when prompted
4. Capture images and receive AI-generated solutions

## Deployment

- Can be hosted on any static file server (GitHub Pages, Netlify, Vercel, etc.)
- Requires HTTPS for camera API access in production
- No environment variables needed - authentication handled through secure API