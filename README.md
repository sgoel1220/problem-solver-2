# OneClick Problem Solver

A web-based application that uses computer vision and AI to solve problems from images. Users can capture images using their device camera and get AI-powered solutions using Google's Gemini 2.0 Flash model.

## Features

- 📷 **Camera Integration**: Capture images using front or back camera
- 🔐 **Secure Authentication**: Basic auth to retrieve API keys safely
- 🤖 **AI-Powered**: Uses Google Gemini 2.0 Flash for problem solving
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **No Backend Required**: Runs entirely in the browser

## How It Works

1. **Login**: Enter credentials to authenticate and retrieve API access
2. **Capture**: Use your camera to take a photo of any problem
3. **Solve**: AI analyzes the image and provides the solution
4. **Repeat**: Continue solving problems with one-click capture

## Getting Started

### Prerequisites

- Modern web browser with camera support
- Valid authentication credentials
- HTTPS connection (required for camera access)

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd oneclick-problem-solver
```

2. Open `index.html` in your web browser or serve it via a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or simply open index.html in your browser
```

3. Navigate to the application and log in with your credentials

## Architecture

- **Frontend Only**: Single HTML file with embedded CSS and JavaScript
- **Authentication**: Secure API key retrieval via Google Apps Script
- **AI Integration**: Direct integration with Google Gemini API
- **Camera API**: Uses WebRTC for cross-platform camera access

## Technology Stack

- Vanilla JavaScript (ES6+)
- CSS3 with Flexbox/Grid
- WebRTC for camera access
- Google Gemini 2.0 Flash API
- Google Apps Script for authentication

## Browser Compatibility

- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

Requires HTTPS for production camera access.

## Security

- No hardcoded API keys or secrets
- Authentication handled through secure external service
- API keys stored only in memory during session
- CORS-compliant requests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.