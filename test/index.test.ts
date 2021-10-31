import { GUARD, PARSE } from "../src";

describe("PARSE", () => {
  it("works", () => {
    const parsed = PARSE(`
      Sitemap: https://www.flyyer.io/api/sitemap.xml

      User-agent: *
      Allow: /
      Allow: /api/sitemap.xml
      Disallow: /api/
      Disallow: /dashboard/
    `);

    expect(parsed).toMatchObject({
      groups: [
        {
          agents: ["*"],
          rules: [
            {
              rule: "allow",
              path: "/",
            },
            {
              rule: "allow",
              path: "/api/sitemap.xml",
            },
            {
              rule: "disallow",
              path: "/api/",
            },
            {
              rule: "disallow",
              path: "/dashboard/",
            },
          ],
        },
      ],
      extensions: [
        {
          extension: "sitemap",
          value: "https://www.flyyer.io/api/sitemap.xml",
        },
      ],
    });
    expect(GUARD(parsed.groups).isAllowed("/")).toBe(true);
    expect(GUARD(parsed.groups).isAllowed("/about")).toBe(true);
    expect(GUARD(parsed.groups).isAllowed("/api/sitemap.xml")).toBe(true);
    expect(GUARD(parsed.groups).isAllowed("/dashboard")).toBe(true);
    expect(GUARD(parsed.groups).isAllowed("/dashboard/flyyer")).toBe(false);
    expect(GUARD(parsed.groups).isAllowed("/dashboard/flyyer/projects")).toBe(false);
  });
});
