/* eslint-disable no-prototype-builtins */

import { RobotsTXTAgentDict } from "./types";

export function PARSE_GROUPS(content: string): RobotsTXTAgentDict {
  let currentGroup = "";
  const unsortedGroups = content
    .split(/\r?\n/)
    .filter((row) => row.trim().match(/^(Allow|Disallow|User-agent).*/gim))
    .reduce((acc, cur) => {
      if (cur.indexOf(":") === -1) return acc;
      const key = cur
        .split(":")[0]
        .replace(/(\s?-\s)/g, "")
        .toLowerCase()
        .trim();
      const value = cur
        .split(":")[1]
        .replace(/(\s?-\s)/g, "")
        .trim();

      const v = value.toLowerCase();
      if (key === "user-agent" && v !== "" && !acc.hasOwnProperty(v)) {
        acc[v] = [];
      }
      if (key === "user-agent") currentGroup = v;
      try {
        if (key !== "user-agent" && value !== "" && currentGroup !== "") {
          acc[currentGroup].push({ instruction: key, path: value });
        }
      } catch (e) {
        // console.log(e);
      }
      return acc;
    }, {} as RobotsTXTAgentDict);
  return unsortedGroups;
}

export function PARSE_SITEMAPS(content: string) {
  const reg = /Sitemap: *([^\r\n]*)/gi;
  let match = reg.exec(content);

  const sitemaps: string[] = [];
  while (match != null) {
    sitemaps.push(match[1]);
    match = reg.exec(content);
  }
  return sitemaps;
}

export function PARSE_HOST(content: string) {
  const reg = /host: *([^\r\n]*)/gi;
  const match = reg.exec(content);
  if (match) return match[1];
  return null;
}

export function CRAWL_DELAY(content: string) {
  const reg = /crawl-delay: *([^\r\n]*)/gi;
  const match = reg.exec(content);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}
