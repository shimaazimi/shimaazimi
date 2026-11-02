# On Ice — Portfolio Design Spec

Status: design approved. Hero prototype: `preview/index.html`.

## Identity

- Name: Shima Azimi / شیما عظیمی
- Title: Frontend Engineer / مهندس فرانت‌اند
- Tagline: "Performance, on and off the ice." / «اجرا، روی یخ و بیرون از آن.» (Persian wording still open)
- Languages: English and Persian, with a full LTR/RTL switch

## Visual language

- Dark only. Midnight navy, icy blue, and one coral accent reserved for the blade's trail.
- Latin type: Sora. Persian type: Vazirmatn.
- One continuous blade line connects every scene as the visitor scrolls.
- A coral progress line at the screen edge shows how far through the "program" the visitor is.

## Scenes

1. **Hero (approved):** the blade carves the name and finishes with a loop. The pointer leaves marks that cool from coral to ice, and chips spray from the blade.
2. **About:** the camera drops low and numbers rise from under the ice and count up.
   - 5 years of experience
   - 25% faster dashboard load (Wallex)
   - 30% faster data load (Atlasdadeh Sefid)
   - 40% faster issue resolution (Sentry, Atlasdadeh Sefid)
   - One line on 2nd place, French National Figure Skating Competition. No photo or video: animation only.
3. **Journey:** the trail skates a program with one stop per company, and the camera turns at each stop.
   - Reyton, Jul 2021 – Jun 2022
   - Hidica, Sep 2022 – Jan 2023
   - Atlasdadeh Sefid, Apr 2023 – Apr 2024
   - Wallex, May 2024 – Mar 2026
   - Dotone Holding (Postex), Apr 2026 – present
4. **Projects:** clear ice blades stand on the rink. Hovering cracks a blade and reveals the project behind it.
   - Zeema.fund
   - Wallpay.info
   - Postex apps (Postex, Shipito, Rahgiri, SuperApp)
   - mcpanel
   - friendscafe.ir
   - More to come from Shima, so projects must live in a data file that is easy to extend.
5. **Skills:** particles gather into six snow crystals that open on hover.
   - Frontend & Mobile
   - Styling
   - Data & APIs
   - Build & Tooling
   - Performance & Quality
   - Testing
6. **Contact:** a final spin, a spiral of light rising from the ice, and an invitation carved into it.
   - Email: shimaazimi75@gmail.com
   - Phone: +98 937 297 3295
   - LinkedIn: linkedin.com/in/shima-azimi
   - Resume download

## Left out of the site on purpose

- The "3 percentage points" debugging-mode metric, because it reads as vague.
- The Reyton percentages, so the numbers stay on the strongest results.
- Screenshots of internal dashboards.

## Engineering requirements

- Stack: Next.js, TypeScript, React Three Fiber, custom shaders, GSAP ScrollTrigger.
- Content renders first and the 3D scene loads after it. Lower scenes load as the visitor approaches them.
- Phones get a lighter version of the same scenes: blades become vertical cards and crystals open on tap.
- `prefers-reduced-motion` gets a version without animation, and browsers without WebGL get a working fallback.
- A live FPS and Web Vitals readout sits in a corner of the site.
- All copy is available in both languages and all content is reachable by keyboard.
