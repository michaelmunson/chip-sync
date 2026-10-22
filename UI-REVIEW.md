## UI overhaul

The map stays the central workspace. A floating header card shows the crew name and site count; a glass dock at the bottom opens Sites, Activity, and Settings, with "Add site" as the primary action. Dialogs have a title, Back/Close actions, a scrolling body, and a sticky footer, and turn into bottom sheets under 640px.

### Design system
- `src/css/tokens.css`: all design tokens (color scale, materials, radii, elevation, motion), base styles, and shared primitives (`.pill`, `.tile`, `.avatar`, `.empty-state`). Dark mode is `<html data-theme="dark">`, set by `ArboristApp` from the Settings control.
- `src/utils/theme.ts`: the MUI theme, reading the same tokens through CSS variables.
- `src/css/{modal,controls,map,design-system,logo,payment}.css`: component styles. `design-system.css` also themes the Amplify Authenticator, onboarding wizard and loader.
- Chips are green and wood is amber everywhere (map markers, pills, tiles).

### Screens
- Sites: search, segmented material filter with counts, and cards (tap for details, trailing directions link).
- Add/Edit site: one shared `MarkerForm` (controlled, keeps input after a failed save).
- Site details: hero, info group, photo grid with lightbox.
- Activity: card feed; join requests open Settings → Members.
- Settings: profile, preferences, organization (access code, members, manage sites), sign out.
- Register: three-step wizard.

### Behavior changes beyond styling
- Removing a drop site in Settings now calls `DB.deleteMarker`. Previously it only changed local state, so deleted sites returned on reload. Member remove/promote and site removal roll back and show an error if the request fails.
- Register validates the ZIP code through geocoding and no longer uses `type=number`. The "Gardner" label is now "Gardener"; the stored value is unchanged.
- Marker InfoWindow HTML escapes user-provided text.
### Validation
- `npx tsc --noEmit`, `npx vitest run` (10 tests: navigation, filtering, search, empty states, formatters) and `npm run build` pass.
- Every screen was checked in Chromium at desktop (light and dark) and 390px mobile against a mocked-data harness (not committed).
- Not validated: authenticated map loading, address predictions, create/edit/delete against a real backend, activity updates, membership, and billing. Check these in the intended AWS environment before release.

### Known, intentionally unchanged
`Geo.getAddressURL` does not URL-encode the address; location polling runs every second; the Google Maps key is fetched from Secrets Manager on each use; `window.exports` shims remain; the Pricing screen is still disabled in `ArboristApp`; `react-spinners` is no longer imported and can be removed from `package.json`.
