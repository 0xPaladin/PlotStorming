# PlotStorming

A web-based creative writing companion that uses AI to spark your imagination. PlotStorming helps writers overcome creative blocks, brainstorm ideas, and organize their projects.

## What is PlotStorming?

PlotStorming is designed for writers who want to harness AI as a creativity tool, not a replacement. Whether you need:

- **Plot ideas** — Generate story concepts and plot twists
- **Character brainstorming** — Develop character backgrounds and personalities
- **World-building prompts** — Spark ideas for settings and worlds
- **Writing prompts** — Get inspired with random scenarios
- **Dialogue assistance** — Explore conversations between characters
- **Organization** — Structure your ideas and projects

PlotStorming provides an intuitive interface to chat with AI models, store your writing content, and organize ideas into folders.

## Features

📝 **Content Management**
- Create and edit notes, outlines, and writing
- Organize content into folders (Settings, Prompts, Characters, Writing, etc.)
- Full CRUD operations for your content
- Markdown rendering support for formatted text

✨ **AI-Powered Creativity**
- Integrated chat with multiple AI models via OpenRouter
- Real-time AI responses to spark ideas
- Include content items in your prompts for contextual responses
- Support for diverse model options (creative, long-form, cost-effective)

💾 **Local Data Persistence**
- All your content stored locally in your browser (IndexedDB)
- No data sent to servers except AI API calls
- Privacy-first design — your writing stays on your device

⚙️ **User Customization**
- Configure your preferred AI model
- Manage API keys securely
- Create custom folder structures for organization
- Save chat history with your AI interactions

## Getting Started

Either install locally or use the hosted version at ... 

### Prerequisites

- An OpenRouter API key (get one at [openrouter.io](https://openrouter.io))

### Installation

1. Clone or download the repository:
```bash
git clone <repo-url>
cd PlotStorming
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

4. Open your browser and visit:
```
http://localhost:5000
```

5. On first use, enter your OpenRouter API key in the settings to enable AI features.

## Usage

### Your First Session

1. **Set up your API key** — Navigate to settings and enter your OpenRouter API key
2. **Choose your model** — Select an AI model that suits your needs (creative, fast, or affordable)
3. **Start brainstorming** — Open a chat and ask the AI anything creative; include background/prompts by checking content items
4. **Organize your ideas** — Create new content items and organize them into folders
5. **Save your work** — Everything is automatically saved as you work

### Folders

PlotStorming comes with pre-configured folders to help organize your work:
- **Settings** — User preferences and configuration
- **Prompts** — Reusable  AI prompts and writing prompts
- **Characters** — Character profiles and backgrounds
- **Writing** — Your actual writing projects and drafts

Create additional folders as needed for your projects.

### AI Models

PlotStorming supports any model available through OpenRouter, including:

**Creative Writing:**
- Qwen/Qwen3-235B
- Google/Gemma-3-27B
- Google/Gemini-2.5-Flash-Lite
- Mistral/Mistral-Small-3.2-24B

**Long-form Content:**
- GLM-4.7-Flash
- ByteDance Seed-1.6-Flash
- Xiaomi MIMO-v2-Flash

## Technical Stack

- **Frontend:** Preact with HTM (no build step required)
- **Server:** Node.js static file server
- **Data Storage:** IndexedDB via localforage
- **AI API:** OpenRouter integration
- **Styling:** Tachyons CSS + custom styles
- **Markdown:** marked.js for rendering
- **Notifications:** iziToast

## Project Structure

```
PlotStorming/
├── index.html              # Main HTML entry point
├── app.js                  # Main Preact application
├── server.js               # Node.js static file server
├── package.json            # Dependencies
├── src/
│   ├── contentManager.js   # Content CRUD and storage
│   ├── userManager.js      # User settings and AI integration
│   └── main.css            # Application styles
└── lib/
    ├── iziToast.min.js     # Toast notification library
    ├── iziToast.min.css    
    └── localforage.min.js   # IndexedDB wrapper
```

## Architecture Highlights

- **Pure ES Modules** — No bundler or build step required
- **CDN-hosted dependencies** — Preact, HTM, and marked loaded from CDN
- **Client-side first** — All data stored locally, only AI requests go to servers
- **Single-page application** — Fast, responsive, works offline (except AI features)

## Configuration

### Environment Variables

None required. API key is managed through the UI settings.

### Storage

- User data stored in `localStorage` (settings, preferences)
- Content stored in IndexedDB via localforage under database name "PlotStorming"

## Keyboard Shortcuts

TODO

## Tips & Tricks

💡 **Create reusable prompts** — Store your best prompts in the "Prompts" folder and refer back to them
💡 **Use structured folders** — Organize by project, genre, or character to keep things manageable
💡 **Save chat history** — Your chats are automatically saved as content items
💡 **Mix and match models** — Try different models for different types of creative work

## Privacy & Security

- ✅ Your content is stored **only in your browser** — never synced to our servers
- ✅ Your OpenRouter API key is stored **locally** — not transmitted except to the API
- ✅ No analytics or tracking
- ✅ No user accounts or logins required

## Troubleshooting

### "API key not working"
- Verify your OpenRouter API key is valid at [openrouter.io](https://openrouter.io)
- Check that your account has credits/valid payment method
- Try a different model

### "My data disappeared"
- Check your browser's local storage settings (may have been cleared)
- Check if you're in a private/incognito window (data is cleared when closing)
- Data is stored per browser/device — switching browsers won't show your data

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check that port 5000 is available
- Try running with explicit host: `node server.js`

## Contributing

This project is open for improvements! Feel free to:
- Report bugs or suggest features
- Improve the UI/UX
- Add new storage backends
- Optimize AI model selection

## License

MIT

## Support

For issues or questions:
- Check the troubleshooting section above
- Create an issue in the repository

---

**Happy writing! Let your imagination run wild with PlotStorming.** 
