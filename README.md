# Chip Sync
## Change Log
- Updated manifest.json

## Web development

Run `npm start` to serve the web app at http://localhost:9999.

If Linux reports `ENOSPC: System limit for number of file watchers reached`, run
`npm run start:polling`. This checks for changes every 300 ms without consuming
inotify watches, at the cost of additional CPU usage. The web watcher excludes
the mobile workspace and generated output; shared code in `packages/` remains
watched.

The web app uses the committed legacy API configuration unless
`src/amplify_outputs.json` is present. Profile reads omit newer optional fields
only when that API explicitly reports them as unsupported. Facilities, job-site
dates, notification preferences, jobs, and service requests require the updated
backend schema in `amplify/data/resource.ts`. Deploy it to the intended environment
before enabling those features. To select a deployed Gen 2 backend locally, copy
its outputs to `src/amplify_outputs.json`; switching outputs alone does not update
the deployed schema. Hosting selects it with `USE_GEN2_BACKEND=true`.

## Mobile development

See [Expo foundation setup and validation](docs/expo-foundation.md) and the [implementation plan](plans/expo.md).
