from pathlib import Path
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    "desktop": {"width": 1024, "height": 768, "stack": ".cs-bg-stack"},
    "tablet": {"width": 768, "height": 1024, "stack": ".cs-bg-stack-t"},
    "mobile": {"width": 464, "height": 872, "stack": ".cs-bg-stack-m"},
}

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    for name, config in VIEWPORTS.items():
        page = browser.new_page(viewport={"width": config["width"], "height": config["height"]})
        page_errors = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on("console", lambda message: print(f"[{name}:{message.type}] {message.text}"))
        page.goto("http://127.0.0.1:4173", wait_until="networkidle")

        active_slide = page.locator(f'{config["stack"]} .cs-bg-active')
        assert active_slide.count() == 1
        assert active_slide.evaluate("el => getComputedStyle(el).transform") == "none"
        assert page.locator(".dock .glass-icon").count() == 4
        page.wait_for_function(
            "document.querySelector('.dock')?.classList.contains('webgl-glass-ready')",
            timeout=5000,
        )
        page.wait_for_function(
            "document.querySelector('.logo a')?.classList.contains('webgl-glass-ready')",
            timeout=5000,
        )
        assert page.locator(".glass-shader-canvas").count() == 2
        assert page.locator(".dock .glass-shader-canvas").evaluate(
            "canvas => canvas.width > 0 && canvas.height > 0"
        )
        shader_before_hover = page.locator(".dock .glass-shader-canvas").screenshot()
        page.locator(".glass-icon").first.hover()
        page.wait_for_timeout(500)
        shader_after_hover = page.locator(".dock .glass-shader-canvas").screenshot()
        assert shader_before_hover != shader_after_hover
        page.mouse.move(0, 0)

        if name == "desktop":
            for _ in range(4):
                opaque = page.locator(".dock .glass-shader-canvas").evaluate(
                    """canvas => {
                      const copy = document.createElement('canvas')
                      copy.width = canvas.width
                      copy.height = canvas.height
                      const context = copy.getContext('2d')
                      context.drawImage(canvas, 0, 0)
                      const pixels = context.getImageData(0, 0, copy.width, copy.height).data
                      let count = 0
                      for (let i = 3; i < pixels.length; i += 4) {
                        if (pixels[i] > 24) count += 1
                      }
                      return count
                    }"""
                )
                assert opaque > 1000
                page.mouse.click(config["width"] - 40, config["height"] / 2)
                page.wait_for_timeout(1000)

        page.screenshot(path=f"/tmp/beams-{name}-landing.png", full_page=True)
        page.locator(".dock").screenshot(path=f"/tmp/beams-{name}-glass-icons.png")
        page.locator(".logo").screenshot(path=f"/tmp/beams-{name}-glass-logo.png")

        page.locator(".about-toggle").click()
        assert page.locator("[data-about-panel]").evaluate("el => el.classList.contains('is-open')")
        assert page.locator(".about-toggle").get_attribute("aria-expanded") == "true"
        page.wait_for_timeout(700)
        page.screenshot(path=f"/tmp/beams-{name}-about.png", full_page=True)

        page.locator("[data-open-profile-gate]").click()
        assert page.locator("#profile-gate").evaluate("el => el.open")
        page.locator("#profile-email").fill("studio@example.com")
        page.locator("[data-profile-form]").evaluate("form => form.requestSubmit()")
        page.locator(".gate-step-actions").wait_for(state="visible")
        download = page.get_by_role("link", name="DOWNLOAD", exact=True)
        assert download.is_visible()
        assert download.get_attribute("target") == "_blank"
        assert download.get_attribute("download") is None

        page.get_by_role("button", name="PREVIEW", exact=True).click()
        page.locator("#portfolio[open]").wait_for()
        assert page.locator(".portfolio-pages img").count() == 8
        sheet_bg = page.locator("#portfolio").evaluate("el => getComputedStyle(el).backgroundColor")
        assert sheet_bg in ("rgba(0, 0, 0, 0)", "transparent")
        close_icon = page.locator(".portfolio-close img")
        assert close_icon.get_attribute("src") == "/icons/icon-close.svg"
        assert close_icon.get_attribute("width") == "48"
        assert close_icon.get_attribute("height") == "48"
        page.locator(".portfolio-close").click()

        Path("/tmp").mkdir(exist_ok=True)
        page.screenshot(path=f"/tmp/beams-{name}.png", full_page=True)
        assert not page_errors, f"{name} page errors: {page_errors}"
        page.close()

    browser.close()
