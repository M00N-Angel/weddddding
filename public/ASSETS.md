# Wedding Assets

Place your media files here:

## Images (`public/images/`)
- `page1.jpg` — Page 1 background (welcome section). Landscape photo works best on desktop; for mobile add `page1-mobile.jpg` (portrait).
- `page1-mobile.jpg` — Optional portrait/vertical version of page 1 background for mobile screens.
- `page2.jpg` — Page 2 background (video section).
- `page2-mobile.jpg` — Optional mobile version.
- `page3.jpg` — Page 3 background (details, dress code, RSVP). Because this section scrolls, a slightly blurred or darker image works well.
- `page3-mobile.jpg` — Optional mobile version.

## Audio (`public/audio/`)
- `background.mp3` — Background music. Loops continuously. User can toggle on/off with the top-right button.

## Video (`public/video/`)
- `wedding.mp4` — Wedding invitation or teaser video. Plays on demand on page 2.

## Guest List (`src/data/guests.ts`)
Edit this file to add guests. Each guest needs:
- `id` — unique URL key (e.g. `"ww2"` → invitation URL `/?id=ww2`)
- `name` — guest name as it should appear (e.g. `"Иван и Мария"`)
- `flag` — `"two"` (couple), `"one"` (single female), or `"male"` (single male)
