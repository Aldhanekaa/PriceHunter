# Price Hunter Chrome Extension

![Price Hunter Chrome Extension](./assets/Price%20Hunter%20Chrome%20Extension.png)

> **⚠️ Development Status: This project is currently under active development. Features may be incomplete or subject to change.**

Compare different online product prices without having to leave your main tab! Price Hunter is a powerful Chrome extension that helps you find the best deals across multiple Indonesian e-commerce platforms.

## 🚀 Features

- **Multi-Platform Price Comparison**: Compare prices across Shopee Indonesia, Lazada Indonesia, and more
- **Seamless Integration**: Works directly in your browser without switching tabs
- **Smart Product Matching**: Automatically finds similar products across different marketplaces
- **Collection Management**: Save and organize your favorite products
- **Real-time Price Tracking**: Get up-to-date pricing information
- **User-Friendly Interface**: Clean, intuitive design for easy navigation

## 📋 Supported Platforms

- **Shopee Indonesia** - Full product scraping and price comparison
- **Lazada Indonesia** - Complete catalog search and price tracking
- **More platforms coming soon!**

## 🛠️ Installation

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/PriceHunter.git
   cd PriceHunter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the extension**

   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

### Production Installation

1. Download the latest release from the releases page
2. Extract the ZIP file
3. Follow steps 4-5 from the development setup above

## 🎯 Usage

1. **Navigate to a supported e-commerce site** (Shopee Indonesia, Lazada Indonesia)
2. **Click the Price Hunter extension icon** in your browser toolbar
3. **Search for products** using the search bar
4. **Compare prices** across different platforms
5. **Save interesting products** to your collections for later reference

## 🏗️ Project Structure

```
PriceHunter/
├── public/                 # Extension assets
│   ├── manifest.json      # Chrome extension manifest
│   ├── background.js      # Service worker
│   └── scrapers/          # Platform-specific scrapers
├── src/                   # React application source
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   └── icons/            # SVG icons
├── test_scraper/         # Testing utilities
└── website/              # Additional web assets
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build with watch mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Adding New Platforms

1. Create a new scraper in `public/scrapers/`
2. Update `manifest.json` with content script configuration
3. Add platform detection logic in `src/utils/`
4. Update the UI to support the new platform

## 🔧 Configuration

The extension uses the following permissions:

- `scripting` - Execute content scripts
- `tabs` - Access tab information
- `storage` - Save user preferences and collections
- `activeTab` - Access current tab content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, TypeScript, and Vite
- Uses Tailwind CSS for styling
- Chrome Extension Manifest V3 compliant

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/yourusername/PriceHunter/issues) page
2. Create a new issue with detailed information
3. Include browser version and extension version in your report

---

**Happy Price Hunting! 🎯**
