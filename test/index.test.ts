import { PARSE } from "../src";

describe("PARSE", () => {
  it("works", () => {
    const result = PARSE(`
      Sitemap: https://www.flyyer.io/api/sitemap.xml

      User-agent: *
      Allow: /
      Allow: /api/sitemap.xml
      Disallow: /api/
      Disallow: /dashboard/
    `);
    expect(result).toMatchObject({
      agents: {
        "*": [
          { instruction: "allow", path: "/" },
          { instruction: "allow", path: "/api/sitemap.xml" },
          { instruction: "disallow", path: "/api/" },
          { instruction: "disallow", path: "/dashboard/" },
        ],
      },
      crawlDelay: null,
      host: null,
      sitemaps: ["https://www.flyyer.io/api/sitemap.xml"],
    });
  });
});
