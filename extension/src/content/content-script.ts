// content-script.ts
// This script is injected into the active tab via chrome.scripting.executeScript.
// It extracts page text securely and returns it.

export function extractPageContent() {
  const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();
  
  let visibleText = document.body ? document.body.innerText : '';
  visibleText = normalizeWhitespace(visibleText);
  
  // Truncate to safety limit (10,000 characters)
  if (visibleText.length > 10000) {
    visibleText = visibleText.substring(0, 10000);
  }

  return {
    url: window.location.href,
    title: document.title,
    text: visibleText
  };
}
