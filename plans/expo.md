Build **Expo Native with `react-native-maps` and Google Maps on iOS**, keeping the existing web app and shared TypeScript code in this repository.

The first release should provide feature parity for gardeners, crew members, and administrators. Plan for **6–10 engineering weeks for one experienced developer**, with a working map/authentication prototype during the first week. Store review and external account setup add calendar time.

1. **Establish the architecture and release scope**

   Use this repository structure:

   ```text
   chip-sync/
   ├── src/                        Existing Vite web application
   ├── amplify/                    Existing backend plus required additions
   ├── mobile/
   │   ├── app/                    Expo Router routes
   │   ├── src/
   │   │   ├── components/         Native design primitives
   │   │   ├── features/           Maps, sites, jobs, requests, chat, settings
   │   │   ├── providers/          Authentication, state, lifecycle
   │   │   └── platform/           Photos, location, storage, navigation
   │   ├── assets/
   │   ├── app.config.ts
   │   ├── eas.json
   │   └── package.json
   ├── packages/
   │   ├── domain/                 Types, validation, formatting, business rules
   │   └── api/                    GraphQL operations and API orchestration
   └── docs/
   ```

   Add npm workspaces for `mobile` and `packages/*`. Keep the web app at the repository root to minimize changes to Amplify Hosting.

   Make these implementation choices:

   | Concern | Decision |
   |---|---|
   | Navigation | Expo Router with native stacks and route-backed sheets |
   | Maps | `react-native-maps`, explicitly using `PROVIDER_GOOGLE` |
   | Styling | React Native `StyleSheet` and shared design tokens |
   | State | React context/hooks; extract reusable business rules into plain TypeScript |
   | Authentication | Existing Cognito, using Amplify’s React Native integration |
   | Backend | Existing AppSync/S3, with additive services where needed |
   | Native projects | Expo prebuild/config plugins; generated projects remain reproducible |
   | Builds | EAS development, staging, and production profiles |
   | Updates | EAS Update with explicit runtime compatibility |

   `react-native-maps` supports Google Maps on iOS; `expo-maps` currently uses Apple Maps there. [Expo map documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)

   **First-release scope:** existing workflows, foreground location, native photos, native navigation/sheets, external driving directions, and existing notification preferences.

   Treat background GPS, offline mutation synchronization, native push delivery, Android release, and embedded turn-by-turn navigation as subsequent increments. They need additional backend and product behavior beyond the current application.

2. **Capture the baseline and configure environments**

   Before extracting code:

   - Record the current web build and test results.
   - Create staging fixtures for a gardener, crew administrator, crew member, and unrelated organization.
   - Capture existing screens, validation, permissions, empty states, and failure behavior.
   - Inventory production Cognito, AppSync, S3, and OAuth configuration without copying secrets into documentation.
   - Establish explicit development, staging, and production mobile configurations.

   This repository can use committed fallback Amplify outputs or generated outputs depending on deployment configuration. Mobile must select its environment explicitly and **fail clearly when configuration is missing**, rather than silently falling back.

   Establish provisional bundle identifiers, such as separate development and production identifiers, under the organization’s actual registered namespace.

   **Acceptance:** the intended AWS environment is visible in development diagnostics, and staging builds cannot accidentally write to production.

3. **Prove the native foundation before porting screens**

   Create the Expo app and pin a tested compatibility matrix for Expo, React Native, React, Amplify, maps, gestures, and sheets. Install Expo-managed dependencies through `expo install`.

   Initial dependencies should cover:

   - Expo Router and development client.
   - `react-native-maps`.
   - Gesture Handler, Reanimated, and a compatible native bottom-sheet library.
   - Safe-area handling.
   - Amplify’s React Native integration and its required native dependencies.
   - AsyncStorage and network-state detection.
   - Expo Location, Image Picker, Image Manipulator, Clipboard, Haptics, and Updates.

   Do not force the existing React 18 web app onto the mobile app’s React version. Keep dependencies declared per application, keep shared packages independent of React, and verify that each bundle resolves one compatible React instance. Expo supports workspace-based monorepos, but dependency resolution needs explicit validation. [Expo monorepo guidance](https://docs.expo.dev/guides/monorepos/)

   Build an installable development app that can:

   - Display a Google map on a physical iPhone.
   - Sign in to staging.
   - Read the current user and organization.
   - Fetch a site/request.
   - Upload and display a photo.
   - Receive a foreground subscription update.

   Initialize Amplify before creating API clients; replace import-time client initialization where necessary.

   **Acceptance:** this vertical slice works in a signed development build, including after app termination and relaunch. Expo Go alone is insufficient validation.

4. **Extract shared logic through explicit platform boundaries**

   Move code incrementally, keeping web-compatible exports during the transition.

   | Current source | Target treatment |
   |---|---|
   | `types/dataTypes.ts` | Shared data contracts; remove top-level `window` assignments |
   | `types/generalTypes.ts` | Separate domain types from React setters and web modal configuration |
   | `utils/markers.ts` | Shared marker/material/date rules |
   | `utils/format.ts`, `requestFormat.ts` | Shared formatting |
   | `utils/notificationSettings.ts` | Shared preferences, including the Lambda consumer |
   | `utils/jobs.ts` | Separate routing/assignment rules from API calls |
   | `graphql/*` | Shared operations required by active features |
   | `database.ts`, `serviceRequests.ts` | Shared orchestration with injected platform services |
   | `location.ts` | Split distance/URL logic from location and address services |
   | `storage.ts` | Separate storage operations from photo preparation |

   Introduce small interfaces for:

   - Location acquisition/subscriptions.
   - Photo preparation and upload.
   - Address predictions, place resolution, and geocoding.
   - Application lifecycle and connectivity.
   - Configuration and external navigation.

   Replace browser `File[]` arguments at shared boundaries with a platform-neutral photo descriptor containing an identifier, name, MIME type, and platform-specific payload reference. Native photo URIs stay inside the native adapter.

   Preserve stored values such as `"gardner"` and existing GraphQL field names. Correcting spelling in persistence would be a separate migration.

   **Acceptance:** shared domain code imports no DOM packages or browser globals; existing web behavior and shared business-rule tests still pass.

5. **Implement native authentication and account lifecycle**

   Connect mobile to the existing user pool and identities. Do not create replacement accounts for existing users.

   Cover:

   - Sign-in, sign-up, confirmation, password reset, and session refresh.
   - Existing Google-authenticated accounts through a system browser and mobile callback URLs.
   - Gardener registration.
   - Crew creation and administrator registration.
   - Joining a crew through an access code.
   - Trial onboarding.
   - Sign-out and clearing user-specific state.

   Production currently preserves legacy Cognito resources, while development configuration differs. Implement OAuth callback changes against the environment’s actual owning configuration.

   If Google login remains available, implement an equivalent privacy-preserving login option—normally Sign in with Apple—unless an applicable exception is established. Avoid linking accounts solely because email addresses match. Apple’s login requirements apply to this decision. [Apple guideline 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services)

   Add an in-app account-deletion flow. The existing database “delete user” operation is not a complete Cognito/account deletion workflow. Handle reauthentication, organization ownership, retained business records, personal data, and retryable cleanup. Account creation makes this a release requirement. [Apple account requirements](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage)

   **Acceptance:** existing users retain their data and role, expired sessions recover correctly, and sign-out/account switching cannot expose the previous user’s state.

6. **Add a native-compatible address service**

   Replace the mobile dependency on Google’s JavaScript loader with an authenticated backend service.

   Add a Maps service Lambda and API Gateway HTTP API with a Cognito JWT authorizer. Publish its endpoint through backend outputs.

   Suggested operations:

   ```text
   POST /maps/autocomplete
   POST /maps/place
   POST /maps/geocode
   POST /maps/reverse-geocode
   ```

   Implement:

   - Places Autocomplete New.
   - Place Details for selected predictions, returning only required location/address fields.
   - Forward geocoding for manually entered addresses.
   - Reverse geocoding after confirmed pin movements.
   - Validated inputs, bounded requests, throttling, and observable error responses.
   - Server credentials stored in Secrets Manager.
   - Separate iOS SDK and server API keys.

   Maintain the existing minimum input length and debounce behavior. Cancel stale searches and ignore out-of-order responses.

   Use an autocomplete session token across prediction requests and the terminating Place Details call. Do not assume a geocoding request terminates a Places session. [Google session documentation](https://developers.google.com/maps/documentation/places/web-service/session-pricing)

   Preserve attribution and apply provider-content storage restrictions; do not introduce an unrestricted persistent cache of predictions or place results. [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies)

   **Acceptance:** mobile address search works without a browser key, unauthorized callers are rejected, and call volume is measurable by operation.

7. **Build navigation, state, and native design primitives**

   Keep the map as the primary workspace. Use native navigation for lists/editors and sheets for contextual details.

   Map the existing destinations:

   | Existing destination | Native destination |
   |---|---|
   | Marker list | Sites |
   | Add/edit marker | Site editor |
   | Marker details | Site detail sheet |
   | Job list/form/details | Jobs stack |
   | Request list/form/details | Role-aware requests stack |
   | Offer form | Offer editor |
   | Messages/chat | Inbox and conversation |
   | Notifications | Activity |
   | Settings | Role-aware settings |

   Gate routes by role and record access. Route parameters should contain IDs and simple values, not complete records, callbacks, or photo objects.

   Introduce a draft store keyed by `draftId` for these round trips:

   - Request editor → move pin → request editor.
   - Site editor → move pin → site editor.
   - Job editor → create facility/job site → job editor.

   Preserve entered fields, photo selections, member assignments, and cancel behavior.

   Replace web presentation dependencies with native components for buttons, inputs, cards, pills, loading states, alerts, confirmations, photo grids, and sheets. Reuse the existing green/amber material language and light/dark tokens.

   Adapt refresh behavior:

   - `document.visibilityState` becomes `AppState`.
   - Backgrounding suspends foreground polling/location work.
   - Foregrounding refreshes records and reestablishes subscriptions.
   - Logout disposes subscriptions, timers, requests, and drafts.
   - Connectivity failures preserve input and provide explicit retry.

   **Acceptance:** back gestures, sheet dismissal, keyboard handling, and interrupted draft flows work consistently.

8. **Port the maps**

   Implement one reusable native map with role-specific configuration.

   Preserve:

   - Drop sites, facilities, and dated job sites.
   - Service-request and job pins.
   - Request status colors and offer badges.
   - Sites/requests/jobs layer toggles.
   - Selected-job filtering and bounds fitting.
   - Current location.
   - Tap placement and draggable draft pins.
   - Camera focus after address search.
   - Light/dark presentation.
   - Links into the corresponding detail screens.

   Replace DOM/SVG marker trees with cached image variants where practical. Keep rich content in native sheets. Use stable marker IDs and update changed markers rather than rebuilding every marker on unrelated state changes.

   Start with the existing unclustered behavior. Test representative datasets at 100, 500, and 1,000 markers; add viewport filtering or clustering if measured device performance requires it.

   Replace recursive location polling with a managed foreground location subscription and explicit “locate me” requests. Preserve the saved ZIP-based center when location is denied.

   Keep driving navigation external. Preserve stop-selection rules, validate Google/Apple URL behavior on supported iOS versions, and provide sequential-stop fallback where multi-stop handoff fails.

   **Acceptance:** both role maps reproduce existing filtering and placement behavior, retain visible attribution, and remain responsive during sheet interaction.

9. **Port every business workflow**

   Implement in this order so each increment is usable:

   | Increment | Required behavior |
   |---|---|
   | Sites | Search/filter, create/edit/delete, material types, facility/job-site dates, contacts, photos, member assignments |
   | Jobs | List/create/details/status, facilities, job sites, assignees, generated stop plans, selected-job map |
   | Gardener requests | Create/edit/cancel/complete, services, timing, contact, photos, pin relocation |
   | Crew requests/offers | Browse open/booked requests, create/edit/withdraw offers |
   | Offer decisions | Accept/decline, response notes, resulting request/conversation state |
   | Messaging | Conversation lists, history pagination, sending, pending/error states, unread handling |
   | Activity/settings | Existing notification preferences, map preference, membership/admin actions, profile and sign-out |

   Native photos must support selection, compression, orientation handling, removal, upload progress/failure, and signed-URL refresh. Preserve the current eight-photo limit.

   Prevent duplicate submissions. For multi-step mutations such as job creation and offer acceptance, define recovery from partial completion before allowing retries; add backend idempotency or conditional writes where required.

   Keep existing SMS/email behavior. Foreground sockets are not background push notifications.

   **Acceptance:** each workflow works against staging from both web and mobile, including failure and retry paths.

10. **Resolve backend access boundaries before release**

    The current schema grants broad authenticated access to several models, and notification subscriptions filter recipients in client code. Client filtering does not enforce record privacy.

    Establish and test a server-side access matrix covering:

    - Conversation participants and their messages.
    - Organization-private jobs and assignments.
    - Administrator-only membership changes.
    - Offer ownership and allowed transitions.
    - Recipient-specific notifications.
    - Photo upload/deletion rights.
    - Intentionally shared sites and public request discovery.

    Tighten resolver/model/storage access where the matrix requires it. Preserve intentional discovery behavior and existing identifiers.

    Make these changes backward compatible with the deployed web app. Additive fields should tolerate older clients; stricter authorization requires coordinated regression testing.

    **Acceptance:** staging tests demonstrate that unrelated users cannot access private records or perform privileged mutations through direct API calls.

11. **Verify quality and prepare distribution**

    Use separate test layers:

    | Layer | Coverage |
    |---|---|
    | Shared unit tests | Formatting, material rules, dates, routing stops, validation, notification preferences |
    | Backend integration | Authorization, address-service authentication, mutation transitions and recovery |
    | Native component tests | Draft preservation, role navigation, permission/error states |
    | Device end-to-end | Registration, placement, jobs, offers, chat, photos, relaunch/session recovery |
    | Physical-device checks | Google Maps, gestures, keyboard, permissions, external navigation, memory behavior |

    Add CI checks for web build/tests, shared packages, mobile type-checking/tests, Expo dependency health, and iOS JS export. Scope test discovery so web Vitest and native tests do not execute each other’s suites.

    Configure EAS environments and build profiles for development, staging, and production. Generate source maps and record app/build/update versions with crash reports. Exclude tokens, message content, and precise location from routine logs.

    Test:

    - The oldest supported iOS version and a current version.
    - A smaller and a larger physical iPhone.
    - Denied and approximate location.
    - Interrupted uploads and poor connectivity.
    - Background/foreground cycles.
    - Expired authentication and signed image URLs.
    - Repeated map/sheet navigation and representative marker loads.

    Before public submission, finish privacy/support materials, permission descriptions, reviewer accounts for both roles, account deletion, and the report/block/support handling appropriate to user-generated messages. Keep the currently disabled purchase flow disabled; any future paid digital entitlement flow needs its own implementation decision.

    **Acceptance:** a production-configured TestFlight build passes the full role matrix, with no unresolved data-loss, access-control, authentication, or critical navigation defects.

12. **Roll out and maintain compatibility**

    Release through internal testing, a limited external TestFlight group, then the App Store.

    Monitor crashes, authentication failures, address-service errors, geocoding/Places usage, mutation failures, and map interaction performance.

    Use EAS Update for compatible JavaScript/assets, with staged rollout and rollback. Native dependency, permission, and SDK changes require a new binary.

    Keep backend changes compatible with older installed mobile versions. Record a supported-client window before removing legacy fields or operations.

    Schedule subsequent increments separately:

    - **Push notifications:** device registration, preferences, delivery, invalid-token cleanup, and notification deep links.
    - **Offline support:** explicit cache policy, local drafts, synchronization, conflict resolution, and idempotency.
    - **Background location:** defined user benefit, permission UX, battery limits, and task lifecycle.
    - **Android:** provider keys, permissions, build/signing, and device validation.

Estimated delivery and touch count:

| Workstream | Engineering days |
|---|---:|
| Baseline, workspaces, signed prototype | 3–5 |
| Shared extraction and configuration | 3–5 |
| Authentication, address service, backend access work | 7–12 |
| Navigation, design system, maps | 6–9 |
| Business screens, photos, messaging | 9–14 |
| Device validation and release preparation | 4–7 |
| **Total** | **32–52 days** |

Budget approximately **110–160 manually maintained file paths added or modified**, including moved code, native routes/components, shared packages, backend additions, configuration, and tests. Generated native projects, lockfiles, and image variants are additional.

The first implementation milestone is a **signed staging iPhone build with Google Maps, existing-account sign-in, one real API read, photo upload, and a subscription update**. Complete that before undertaking the full screen port.
