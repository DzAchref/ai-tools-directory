# AI Tools Directory

> 🤖 A curated directory of the best AI tools — free to use, free to host.

## Quick Start

Just open `index.html` in a browser, or serve with any static server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node
npx serve .

# Option 3: Open directly
start index.html
```

## Deploy to Netlify (Free)

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repo → Deploy (no build config needed)
4. Your site is live at `https://your-site.netlify.app`

## Monetization Setup

1. **Affiliate Links**: Replace `affiliateUrl` values in `data/tools.json` with your actual affiliate links
2. **Google AdSense**: Add your AdSense code in `index.html` head
3. **Google Analytics**: Replace `G-XXXXXXXXXX` in `index.html` with your GA4 ID
4. **Newsletter**: Replace `YOUR_FORM_ID` in `js/app.js` with your Formspree form ID
5. **Sponsored Listings**: Contact tool makers for featured placement deals

## Adding New Tools

Edit `data/tools.json` or `data/tools-extended.json`:

```json
{
  "id": "unique-id",
  "name": "Tool Name",
  "category": "Code",
  "description": "Brief description",
  "pricing": "freemium",
  "rating": 4.5,
  "website": "https://example.com",
  "affiliateUrl": "https://example.com/?ref=you",
  "icon": "🔧",
  "iconBg": "linear-gradient(135deg, #color1, #color2)",
  "tags": ["tag1", "tag2"],
  "featured": false,
  "dateAdded": "2026-03-27"
}
```

## Tech Stack

- Pure HTML / CSS / JavaScript (no frameworks)
- JSON data fetched at runtime
- Free hosting on Netlify / GitHub Pages
- Formspree for form handling (free tier)

## License

MIT
