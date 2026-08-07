# Finance Tracker Ai

An Expo (React Native + TypeScript) personal finance tracker backed by Supabase.
Track income and expenses, set up recurring transactions, and review spending
through analytics and a searchable history.

- **Android package / iOS bundle id:** `com.haseebkhan.financetrackerai`
- **Working branch:** `master`
- **Currency:** Rs (see `CURRENCY_SYMBOL` in [lib/utils.ts](lib/utils.ts))
- **Theming:** light/dark with a System/Light/Dark selector in Settings. Styles
  are built through `useThemedStyles` in [lib/useTheme.ts](lib/useTheme.ts) —
  never import a colour palette directly into a `StyleSheet.create` call, or
  that screen will stop reacting to theme changes.

## Local development

```bash
npx expo start
```

Copy `.env.example` to `.env` and fill in the Supabase URL and anon key. `.env`
is gitignored and must never be committed.

## EAS Build

### One-time setup

The project is linked to the personal EAS account `dev.mhaseebkhan`. Before the
first build, link it and register the Supabase variables — remote builds do
**not** receive your local `.env`, so without this step the app ships with an
empty Supabase config and every request fails.

```bash
npx eas-cli init
```

```bash
npx eas-cli env:set --name EXPO_PUBLIC_SUPABASE_URL --value "<your-supabase-url>" --environment development --environment preview --environment production --visibility plaintext
```

```bash
npx eas-cli env:set --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<your-anon-key>" --environment development --environment preview --environment production --visibility plaintext
```

The anon key is a publishable key protected by row-level security, so
`plaintext` visibility is appropriate; it is still kept out of git.

### Build commands

```bash
npm run build:dev
```

```bash
npm run build:preview
```

```bash
npm run build:prod
```

`npm run build` is an alias for `build:preview`, since that's the one used
for real-device testing day to day. Each of these is a thin wrapper around
the matching `eas build --profile <name> --platform android` — use the raw
`eas build` form directly if you need extra flags (e.g. `--local`,
`--non-interactive`).

| Profile | Output | Distribution | Use |
| --- | --- | --- | --- |
| `development` | APK | internal | Debug build with `expo-dev-client`; pairs with a running Metro server. |
| `preview` | APK | internal | Installable release build — this is the one for real-device testing. |
| `production` | AAB | store | Play Store upload artifact. |

**Preview and production embed the JS bundle at build time** — unlike a
`development` build, they are not connected to Metro. Any JS/TS change (a
screen, a store, navigation) needs a new `preview`/`production` build to
show up on a device already running an older one. A `development` build
just needs an app reload; it pulls fresh JS from Metro.

### Versioning

`cli.appVersionSource` is `local`, so `android.versionCode` in
[app.json](app.json) is the source of truth and `autoIncrement` bumps it there
on every `preview` and `production` build. **Commit the bump afterwards**, or
the next build will reuse the same number.

If that becomes tedious, switching `appVersionSource` to `remote` hands version
tracking to EAS instead and the `app.json` value is then ignored — that is
Expo's current recommendation, and it is a one-line change.

### Files

- `eas.json` — build profiles. Contains no secrets and **is** committed.
- `.easignore` — controls what gets uploaded to the build servers. It
  **replaces** `.gitignore` rather than extending it, so anything added to
  `.gitignore` must be mirrored there too, `.env` above all.
- `credentials.json`, keystores, `.apk`/`.aab` — gitignored, never committed.
