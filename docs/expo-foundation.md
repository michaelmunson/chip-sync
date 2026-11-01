# Expo foundation

Implementation of the first increment in [the Expo plan](../plans/expo.md). The web application remains at the repository root; `mobile` is an npm workspace alongside the React-free `packages/domain` and `packages/api` packages.

The native app is a development prototype. It supports existing confirmed email/password accounts, session restoration, a profile/organization read, a site or service-request read by ID, foreground update subscriptions, a Google map, foreground location, and a photo upload/display/delete check. It is not ready for public distribution. The first signed staging iPhone milestone remains open until the physical-device checks below pass.

## Baseline and shared extraction

Before extraction on October 22, 2026, `npm run test:run` passed 49 tests across nine files and `npm run build` passed. Existing warnings were the React testing-library `act` deprecation and Vite's large production chunk warning.

Data contracts, formatting, request formatting, material/date rules, and notification preferences now live in `packages/domain`. The old web import paths re-export their existing names. The notification Lambda imports the shared preference module directly. Stored values, including `gardner`, remain unchanged. Browser bridge globals are initialized in the web entry point rather than shared data contracts. Existing formatting/preference tests moved with their implementation and run in Node without DOM libraries.

`packages/api` provides the prototype operations through an injected GraphQL transport. It has no React, Amplify, DOM, or native imports. Native Amplify configuration completes before constructing its API client. Full database/job/request orchestration and the remaining web clients have not yet been extracted.

## Dependency matrix

The lockfile records the installed versions. Expo-managed modules were selected using `expo install`; React Native matches SDK 55's bundled dependency matrix. This matrix has passed TypeScript and iOS JavaScript export checks, but still requires signed native/device validation.

| Dependency | Version |
| --- | --- |
| Expo | 55.0.32 |
| React Native | 0.83.10 |
| React, mobile | 19.2.0 |
| React, web | 18.3.1 |
| Amplify | 6.22.2 |
| Amplify React Native | 1.3.3 |
| Google map component | react-native-maps 1.27.2 |
| Gesture Handler | 2.30.x |
| Reanimated / Worklets | 4.2.1 / 0.7.4 |
| Bottom sheet | 5.2.14 |

The Router stack, gesture root, and safe-area provider are installed. Full route-backed sheets and business screens are subsequent increments. Metro uses Expo's standard workspace configuration, including SDK 55's automatic autolinking resolution. `npm run check:react` verifies that React DOM uses web React and the native renderer, Router, and bottom-sheet package resolve mobile React. The iOS export additionally inspects its source map to confirm that it contains exactly one React implementation at the mobile version and no web React 18 implementation. Shared packages have no React dependencies.

Expo Doctor traverses peers into the root web application and reports both React versions. The health wrapper accepts only that exact diagnostic (mobile React at `node_modules/react` and web React at `../node_modules/react`); other duplicate native modules or failed checks still fail CI. This exception keeps the separate React versions required by the plan without disabling the duplicate-module check.

## Register environments

Do not copy the web fallback outputs into mobile. The web fallback's legacy “staging” labels do not establish isolation: production preserves that Cognito pool. `amplify/auth/resource.ts` owns the main-branch reference; other branches currently create separate email-only pools. Production OAuth changes must be made in the actual owner of the referenced resources, not just the development auth definition.

1. Verify the organization's registered Apple namespace, EAS project, and actual production resources. Identifiers in `mobile/config/environments.example.json` are provisional.
2. Copy that example to `mobile/config/environments.local.json`. Replace all resource placeholders for production and the target environment with independently verified values. Each nonproduction app needs its own bundle identifier, callback scheme, Cognito pool/client, identity pool, AppSync endpoint, and storage bucket.
3. Save the target branch's generated **Gen 2** Amplify outputs as `mobile/config/outputs/staging.json` (or `development.json`/`production.json`). These directories/files are gitignored. Mobile does not read root or web outputs.
4. Copy `mobile/.env.example` to `mobile/.env`. Set `APP_ENV`, `EAS_PROJECT_ID`, and `GOOGLE_MAPS_IOS_API_KEY`. Enable the Google Maps SDK for iOS and restrict this SDK key to the selected bundle identifier. The key is embedded in the native app; it is not a server Places key.
5. For remote EAS builds, define `MOBILE_ENVIRONMENTS_JSON` and `MOBILE_AMPLIFY_OUTPUTS_JSON` as JSON string environment variables alongside the project ID and maps key. EAS cannot read local gitignored files. Configure development, preview (staging), and production environments separately. Use variables available during local EAS config evaluation as well as the remote build.

Build-time validation requires an explicit environment and complete registration, compares the selected outputs to the registered identifiers, and rejects overlap with registered production resources or the preserved legacy production identifiers. Production registration must be kept current when backend resources change. It does not infer an environment from a resource's name. No AWS credentials, account passwords, or tokens belong in these files. Ordinary Amplify client outputs are public application configuration.

Only the environment label appears in every build. Development mode also shows the user-pool identifier and API host. AppSync uses Cognito authorization explicitly. The prototype does not modify backend authorization rules; record privacy still requires the server-side access work in the plan.

## Run and build

Install from the repository root:

```sh
npm install --no-audit --no-fund
npm run mobile
```

For the first signed staging build, run from `mobile` after configuring the EAS account, Apple signing, and registered physical test device:

```sh
npx eas-cli build --platform ios --profile staging
```

Install that development build on the iPhone, then run `npm run mobile` from the root with the matching staging configuration. On macOS with Xcode, `npm run ios --workspace @chip-sync/mobile` can build locally. Generated `mobile/ios` and `mobile/android` directories are ignored and must remain reproducible through prebuild/config plugins.

EAS profiles select explicit environments and separate update channels. Runtime compatibility uses Expo's fingerprint policy. Native dependency, maps-key, permission, and native configuration changes require a rebuilt binary. No builds or updates have been uploaded by this implementation.

## Staging fixtures and device acceptance

No AWS fixtures or accounts were created as part of local implementation. Prepare these in a verified isolated staging backend, using the existing web registration and editor flows:

| Fixture | Required records and checks |
| --- | --- |
| Gardener | Confirmed email/password Cognito account, existing `gardner` profile, owned service request with a photo |
| Crew administrator | Confirmed account, organization, facility/drop site and dated job site |
| Crew member | Confirmed account joined to the same organization |
| Unrelated organization | Separate administrator and organization for later direct-API authorization tests |

Record fixture IDs in a private test run, and keep passwords out of the repository. Capture the existing web map, site/request editors, organization membership, photo limits, permission failures, empty states, and retry behavior before porting those screens. The baseline above records automated behavior; screen captures and a full parity matrix remain to be collected.

Validate the following on a signed physical iPhone before starting the full screen port:

- Confirm the displayed environment, pool, and API host are staging; existing users retain their profile ID, role, and organization.
- Sign in, terminate the app, relaunch, and verify session restoration and a real profile read. Also test expired sessions, sign-out, and switching accounts.
- Load a real site or request ID. Verify its Google map pin and signed photo URLs.
- Edit that record from staging web while mobile is foregrounded. Verify the update counter increments and the pin/details update. Background/foreground and reconnect, then repeat. Updates stop when the screen/account is disposed.
- Choose and upload a test photo. Verify the remote image, background/foreground URL refresh, upload failure/retry, and explicit deletion. A per-account pending S3 key is saved before upload so interrupted checks can be cleaned up after relaunch. The proof does not attach images to business records and is disabled in production.
- Deny location and photo access; verify useful errors and continued map access. Check keyboard handling, safe areas, and gestures on the device.

The current map starts at a neutral US overview until a record or location is selected. ZIP-based fallback, layer toggles, rich markers, sheets, full editor photo grids/eight-photo enforcement, and role workflows remain for the map/screen port. Google/Apple OAuth, registration/reset/MFA flows, and account deletion are not implemented by this prototype.

## Automated checks

```sh
npm run test:run
npm run build
npm run typecheck:shared
npm run test:shared
npm run typecheck:mobile
npm run test:mobile
npm run check:react
npm run check:mobile:dependencies
npm run check:mobile:health
npm run export:ios:validation
```

Web/backend tests, shared tests, and mobile configuration tests have separate discovery. The validation helper supplies synthetic `.invalid` AWS endpoints to Expo dependency checks and the iOS export; it never signs, submits, or connects to AWS. It is not a staging configuration. `npm run prebuild:ios:validation` temporarily generates ignored iOS sources, checks the Google Maps integration and foreground-only permissions, and removes those synthetic sources afterward. It refuses to overwrite an existing `mobile/ios` directory. The generated SDK 55 target currently supports iOS 15.1 and later; physical-device validation is still required.

CI runs the checks above on Node 22. It follows the repository's Amplify Hosting installation approach because of existing Gen 2 bundled dependency lockfile limitations. Native component/device tests, staging integration tests, performance measurements, crash-report integration, and distribution checks remain open.

References: [Expo monorepos](https://docs.expo.dev/guides/monorepos/), [SDK 55 maps and Google provider configuration](https://docs.expo.dev/versions/v55.0.0/sdk/map-view/), [Amplify React Native setup](https://docs.amplify.aws/react-native/start/quickstart/).
