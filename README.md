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

  User-agent: googlebot
  Allow: /
  Disallow: /secret-page

  User-agent: *
  Allow: /
  Allow: /api/sitemap.xml
  Disallow: /api/
  Disallow: /dashboard/
`);

console.log(result)

const guard = GUARD(parsed.groups);
function isAllowed(path: string, userAgent?: string): boolean {
  const rule = guard.isAllowedBy(path, userAgent);
  if (rule) {
    // rule.allow // path is allowed or not.
    // rule.pattern.path // path from robots.txt (eg: "/api/sitemap.xml", "/", "/api/").
    // rule.pattern.regexp // regex version of rule.pattern.path.
    return rule.allow
  }
  // If not rule is found assume true.
  return true;
}

expect(isAllowed("/")).toBe(true);
expect(isAllowed("/about")).toBe(true);
expect(isAllowed("/api/sitemap.xml")).toBe(true);
expect(isAllowed("/dashboard")).toBe(true);
expect(isAllowed("/dashboard/flyyer")).toBe(false);
expect(isAllowed("/dashboard/flyyer/projects")).toBe(false);

expect(isAllowed("/secret-page")).toBe(true);
expect(isAllowed("/secret-page", "slackbot")).toBe(true);
expect(isAllowed("/secret-page", "Slackbot")).toBe(true);
expect(isAllowed("/secret-page/hello", "Slackbot")).toBe(true);
expect(isAllowed("/secret-page", "googlebot")).toBe(false);
expect(isAllowed("/secret-page", "Googlebot")).toBe(false);
expect(isAllowed("/secret-page/hello", "Googlebot")).toBe(false);
```

Prints:

```json5
{
  "groups": [
    {
      "agents": ["googlebot"],
      "rules": [
        {"path": "/","rule": "allow" },
        {"path": "/secret-page","rule": "disallow" },
      ],
    },
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
