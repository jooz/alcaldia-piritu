# Vercel Edge Runtime Fix

When deploying a Next.js project to Vercel that uses `jose`, `@auth/core`, or other Node.js APIs, you may encounter build warnings about APIs not supported in Edge Runtime.

## Symptom

```
⚠ Compiled with warnings in 1000ms
./node_modules/jose/dist/webapi/lib/deflate.js
A Node.js API is used (CompressionStream at line: 10) which is not supported in the Edge Runtime.
```

## Root Cause

Vercel uses **Edge Runtime** by default for API routes. However, certain packages (`jose`, `@auth/core`) use Node.js APIs (`CompressionStream`, `DecompressionStream`) that are not available in Edge Runtime.

## Fix

Create a `vercel.json` file in the project root:

```json
{
  "framework": "nextjs",
  "functions": {
    "api/**/*.ts": {
      "runtime": "node"
    },
    "api/**/*.js": {
      "runtime": "node"
    }
  }
}
```

This forces Vercel to use **Node.js runtime** for all API routes, which supports the full Node.js API surface required by `jose`, `@auth/core`, and similar packages.

## When to Use Edge Runtime Instead

If your API routes don't use Node.js-specific APIs, you can keep Edge Runtime for better performance. Move `jose`/`@auth/core` imports behind a dynamic import or use `next/dynamic` with `ssg: false`.

## References

- Next.js Documentation: https://nextjs.org/docs/api-reference/edge-runtime
- Vercel Docs: https://vercel.com/docs/functions/edge-and-node-runtimes