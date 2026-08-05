# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Workflow: test, commit, and push after every task

At the end of every prompt that changes files in this repo, do all three without
being asked again:

1. **Test** — run `npx tsc --noEmit`, and boot the Metro bundler to confirm the
   app still bundles (`npx expo start` and request the bundle). Report real
   results; if something fails, say so rather than committing over it.
2. **Commit** — stage the work and write a *detailed* commit message: a short
   imperative subject line, then a body explaining what changed and why,
   including any non-obvious fixes or trade-offs.
3. **Push** — `git push` to `master`.

Notes:
- The working branch for this project is `master` (not `main`).
- Do not commit `.env`; it is gitignored and holds live Supabase keys.
- If tests fail, fix the failure or report it — never push a knowingly broken tree.
