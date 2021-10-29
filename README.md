# @flyyer/robotstxt

Built with TypeScript.

```sh
yarn add @flyyer/robotstxt
```

## Usage

```ts
import * as robotstxt from "@flyyer/robotstxt";

const result = PARSE(`
  Sitemap: https://www.flyyer.io/api/sitemap.xml

  User-agent: *
  Allow: /
  Allow: /api/sitemap.xml
  Disallow: /api/
  Disallow: /dashboard/
`);

console.log(result)
```

```json
{
  "sitemaps": [
    "https://www.flyyer.io/api/sitemap.xml"
  ],
  "agents": {
    "*": [
      {
        "instruction": "allow",
        "path": "/"
      },
      {
        "instruction": "allow",
        "path": "/api/sitemap.xml"
      },
      {
        "instruction": "disallow",
        "path": "/api/"
      },
      {
        "instruction": "disallow",
        "path": "/dashboard/"
      }
    ]
  },
  "crawlDelay": null,
  "host": null
}
```
