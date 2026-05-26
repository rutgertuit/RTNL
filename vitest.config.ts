import { defineConfig } from "vitest/config";

// Vitest 4 uses rolldown-vite which uses oxc as the JS/TS transformer. The
// project's tsconfig.json has `"jsx": "preserve"` (required by Next.js) so
// `.tsx` files cannot be parsed by the default oxc plugin without help.
// Telling oxc to use the automatic JSX runtime here lets the headless sim
// test pull in `cards.tsx` transitively via `reducer.ts` without forcing a
// project-wide tsconfig override that would break the Next.js build.
export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    watch: false,
    include: ["app/**/__tests__/**/*.test.ts"],
  },
});
