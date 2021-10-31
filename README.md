# @flyyer/robotstxt

Pure JS robots.txt parser and guard built with TypeScript and ESM support (tree-shaking).

```sh
yarn add @flyyer/robotstxt
```

Works on Node.js, Browsers, ReactNative, and WebWorker environments.

## Usage

```ts
import * as robotstxt from "@flyyer/robotstxt";

const result = robotstxt.PARSE(`
  Sitemap: https://www.flyyer.io/api/sitemap.xml

  User-agent: *
  Allow: /
  Allow: /api/sitemap.xml
  Disallow: /api/
  Disallow: /dashboard/
`);

console.log(result)

const guard = GUARD(parsed.groups);
expect(guard.isAllowed("/")).toBe(true);
expect(guard.isAllowed("/about")).toBe(true);
expect(guard.isAllowed("/api/sitemap.xml")).toBe(true);
expect(guard.isAllowed("/dashboard")).toBe(true);
expect(guard.isAllowed("/dashboard/flyyer")).toBe(false);
expect(guard.isAllowed("/dashboard/flyyer/projects")).toBe(false);
```

Prints:

```json5
{
  "groups": [
    {
      "agents": ["*"],
      "rules": [
        { "rule": "allow", "path": "/" },
        { "rule": "allow", "path": "/api/sitemap.xml" },
        { "rule": "disallow", "path": "/api/" },
        { "rule": "disallow", "path": "/dashboard/"  },
      ]
    }
  ],
  "extensions": [
    { "extension": "sitemap", "value": "https://www.flyyer.io/api/sitemap.xml" },
  ],
}
```

---

Kudos to [Woorank/robots-txt-guard](https://github.com/Woorank/robots-txt-guard)
