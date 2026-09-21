# ScamCheck Browser Extension

This is the browser extension for ScamCheck, which allows you to quickly analyze the current webpage for opportunities, risks, fees, and overall credibility.

## Phase 3A/3B Capabilities
- Integrates seamlessly with the local ScamCheck backend.
- Reads visible page text safely (up to 10k characters).
- Displays a compact analysis report directly in the popup UI.
- Secure, with minimal permissions (`activeTab`, `scripting`) and no background monitoring.

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Backend URL (Optional):**
   By default, the extension points to `http://localhost:5001`. If you need to change this, create a `.env` file in this directory:
   ```env
   VITE_SCAMCHECK_API_URL=http://localhost:5001
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```
   This will generate a `dist` directory.

## Installation in Chrome (Local Unpacked)

1. Open Google Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the `dist` folder located inside the `extension` directory (`extension/dist`).
6. The ScamCheck extension should now appear in your toolbar!

## Manual Testing

1. Ensure the ScamCheck backend (`npm run dev` in `/backend`) and ML service (`uvicorn` in `/ml-service`) are both running.
2. Open a new tab and navigate to any page containing a job listing or course (e.g., a dummy internship page).
3. Click the ScamCheck extension icon in the toolbar.
4. Click **Analyze Current Page**.
5. Verify the loading spinner appears, and after a few seconds, the compact report should display showing the Risk Level and Suitability score.

## Known Limitations
- The extension does not currently monitor pages in the background. You must explicitly click the extension to analyze.
- Text selection analysis and screenshot capture are not yet implemented (slated for later phases).
- Specific platform integrations (e.g., LinkedIn DOM-parsing) are not supported yet; it falls back to extracting all visible text.
