import os
import uuid
import logging
from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)

# Ensure the screenshots directory exists
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "static", "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

async def scrape_and_screenshot(url: str):
    """
    Navigates to the URL, extracts the visible text, takes a screenshot,
    and returns (text_content, screenshot_filename).
    """
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(SCREENSHOTS_DIR, filename)
    
    logger.info(f"🚀 Playwright booting up to browse: {url}")
    
    try:
        async with async_playwright() as p:
            # Launch Chromium in headless mode
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={"width": 1280, "height": 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            # Navigate to the URL and wait for it to be mostly loaded
            await page.goto(url, timeout=15000, wait_until="networkidle")
            
            # Take a screenshot
            await page.screenshot(path=filepath, type="png", full_page=False)
            
            # Extract main text content
            text_content = await page.evaluate("() => document.body.innerText")
            
            await browser.close()
            
            logger.info(f"✅ Successfully scraped {url} and saved screenshot to {filename}")
            # Limit text to ~15k characters to prevent context window overflow
            return text_content[:15000], filename
            
    except Exception as e:
        logger.error(f"❌ Playwright error browsing {url}: {e}")
        return f"Error browsing {url}: {str(e)}", None
