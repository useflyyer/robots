import { GUARD, PARSE } from "../src";

describe("PARSE", () => {
  it("works", () => {
    const parsed = PARSE(`
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

    expect(parsed).toMatchObject({
      groups: [
        {
          agents: ["googlebot"],
          rules: [
            {
              path: "/",
              rule: "allow",
            },
            {
              path: "/secret-page",
              rule: "disallow",
            },
          ],
        },
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

    const guard = GUARD(parsed.groups);
    function isAllowed(path: string, userAgent?: string) {
      const rule = guard.isAllowedBy(path, userAgent);
      return rule ? rule.allow : true;
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
  });
});
