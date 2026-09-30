# imene.os assets

Drop these files in and the site picks them up. Anything missing shows a placeholder card with the expected file name.

| File | What it is | Notes |
| --- | --- | --- |
| `portrait.jpg` | Portrait for the my-bio window | 3:4 portrait, shown as a 180px rounded rectangle |
| `community-live.jpg` | A live community session | Around 16:8, shown full width |
| `clients/<slug>.jpg` | Optional anonymized screenshot per full build | Blur names first. Slugs are listed below |
| `music/lofi.mp3` | Background music, looped when a visitor turns Sound on | Royalty-free or licensed only. Change the path, title or volume in `content.js` under `music`. Missing file falls back to rain |
| `og-image.png` | 1200x630 share image | A first version is generated from the desktop layout |
| `bg/lofi-day.jpg` | Light theme scene (sunset room) | Swap in `content.js` under `backgrounds` |
| `bg/lofi-night.jpg` | Dark theme scene (rainy night room) | Same |

Full build slugs for `clients/`:
ecommerce, venture-biotech, publishing, installation, multi-service-agency, talent-agency, online-course, college-admissions, athlete-foundation, it-services, coaching, agency-owner, property-management, insurance-agency
