## Workspace UI refactor

The map remains the central workspace. A persistent header identifies the crew and member, a site overview shows the organization’s saved locations, and labeled navigation opens sites, creation, activity, and settings. On narrow screens the overview becomes compact and the navigation remains within the viewport.

Shared visual tokens live in `src/css/design-system.css`; Material UI colors, typography, and component defaults live in `src/utils/theme.ts`. Authentication and registration use the same forest-green and neutral palette. The workspace follows the system color preference, with the existing settings control retained.

Dialogs have an accessible title, an explicit close action, bounded height, scrolling content, and actions inside the panel. Site lists update when organization data changes, sort without mutating stored marker objects, and show a useful action when filters are empty. Site creation reports save failures and allows retry. Map loading failures explain how to continue using site tools.

## Validation

- `npm run build` succeeds; existing lint and bundle-size warnings remain.
- `npx tsc --noEmit` succeeds.
- `CI=true npm test -- --watchAll=false --runInBand`: three tests cover navigation routing, unread counts, filtering, empty-state actions, and live site-list refresh.
- Chromium renders the actual sign-in screen at desktop and mobile sizes without horizontal overflow.
- An offline Chromium fixture checks navigation bounds at 320, 390, 768, and 1440 pixels, plus site-list and add-site dialogs. Its placeholder map is explicitly labeled; it does not validate authenticated services.
- For local build validation, copy the repository’s `aws-exports-copy.js` to the ignored `src/aws-exports.js`; production continues to use Amplify-generated configuration.

Before release, verify authenticated map loading, address predictions, site create/edit/delete, activity updates, organization membership, and subscription actions with the intended AWS environment. No production data or deployments are changed by this PR.
