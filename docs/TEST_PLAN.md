# Prodify / ZENKAI OS test cases

## Automated coverage

Run `npm test` from both `backend` and `frontend`. The backend suite uses two disposable verified accounts, exercises the HTTP routes against MySQL, and removes the fixture accounts afterward. It does not send email or modify existing user accounts. The frontend suite checks timer duration rules and the available appearance presets.

The backend integration suite covers login and protected routes; account isolation; profile defaults, palette persistence and poster upload/retrieval/removal; power settings and rank thresholds; quest, goal, training, category and legacy-import flows; habits and their date views; focus session persistence and stats; and journal create/update/read/delete and stats.

## Browser acceptance cases

Run with a fresh test account on desktop and at a narrow mobile width. These are end-to-end visual and interaction checks that complement the automated route and logic tests.

| ID | Area | Steps | Expected result |
| --- | --- | --- | --- |
| UI-01 | Signup and login | Sign up with an unused email, verify the emailed OTP, sign out, and sign back in. Try an incorrect password and an unverified account. | Verified account reaches the dashboard; invalid credentials show an error; unverified account is asked to verify. |
| UI-02 | Navigation and responsive layout | Open every sidebar destination; use the mobile menu, close button, and scrim at narrow width. | Each destination loads; mobile navigation opens and closes; content remains usable without horizontal overflow. |
| UI-03 | Quests | Add a quest with a custom category, complete/uncomplete it, then delete it. | Changes sync after reload; completion updates earned XP and the progression display. |
| UI-04 | Goals | Add a goal/project, increment/decrement progress, edit the target and details, then delete it. | Progress stays between zero and target and persists after reload. |
| UI-05 | Training | Add a practice entry, mark it solved/unsolved, and delete it. Try a custom training category. | Duration, category, solved state and derived XP update and persist. |
| UI-06 | Personal categories | Add categories independently for quests, goals and training; use each in its form; remove a category. | Each module shows only its own custom categories and changes persist. |
| UI-07 | Focus controls | Set focus and break minutes from the Overview controls, open Time Chamber, change each there, then return to Overview. | Both screens show the same chosen values; values remain after reload; invalid and out-of-range entries clamp to 1–60 focus minutes and 1–30 break minutes. |
| UI-08 | Timer lifecycle | Start, pause, resume and reset a focus timer. Complete a short test session, then inspect Overview and Analytics. | Countdown remains accurate across navigation; one completed focus session is saved and counted once; breaks are not recorded as focus sessions. |
| UI-09 | Habits | Add a habit, toggle today on and off, inspect month/calendar and analytics, then delete it. | Today and month views agree; streak/summary updates; deleted habit no longer appears. |
| UI-10 | Appearance presets | Choose each of the five palettes and navigate between dashboard pages and after reload. | Selected palette is visibly indicated, applied across dashboard surfaces, and remains selected for that account. |
| UI-11 | Favorite character art | Upload PNG/JPEG/WebP/GIF under 4 MB, replace it, remove it, then reload. Try an unsupported or oversized file. | Preview and top-bar thumbnail reflect the saved image; replacement and removal persist; invalid files show a helpful error. |
| UI-12 | Power profile | Change XP pace, reward values and rank names; save and reload, then reset to defaults and save again. | Settings persist; the dashboard shows the current rank, next rank, required XP and progress; initial power level is `000001`. |
| UI-13 | Soundscape | Choose a sound preset, play/pause, adjust volume and track position, then navigate to another page. | Playback controls respond and the mini-player reflects the active track. |
| UI-14 | Journal | Create an entry with a mood, edit it, inspect month/list and stats, then delete it. | Entry content and mood persist and appear on the correct date. |
| UI-15 | Accessibility and motion | Navigate with keyboard only; inspect focus rings; enable reduced motion in the OS/browser. | All controls are reachable and have visible focus; nonessential motion is minimized. |

## Browser smoke checks performed

- Signup and login forms stop empty submissions with required-field feedback; an invalid login shows the API error.
- A disposable verified account signed in and opened Overview and Personalize; the initial power level displayed as `000001`, with the Saiyan target at level 11 / 1,000 XP.
- The Super Saiyan and Namek palettes could be selected, showed the active state, and remained selected after navigating away and back.
- Focus and break durations changed from Overview, appeared in Time Chamber, changed there, and propagated back to Overview.
- The disposable browser account was signed out and removed from MySQL after the check.

## Acceptance cases still requiring manual end-to-end coverage

Signup email delivery and valid OTP completion require a real mail provider, so the tests deliberately avoid sending mail. The browser matrix above still lists the remaining UI flows; their API and data behavior is covered by the backend integration suite, but the full set of UI interactions has not been manually exercised.
