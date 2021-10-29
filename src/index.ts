/* eslint-disable no-prototype-builtins */

export type RobotsTXTAgentDict = Record<string, RobotsTXTAgentDirective[]>;
export type RobotsTXTAgentDirective = {
  instruction: string;
  path?: string;
};

interface RobotsTXTStruct {
  readonly content: string;
  readonly agents: RobotsTXTAgentDict;
  readonly sitemaps: string[];
  readonly crawlDelay: number | null | undefined;
  readonly host: string | null | undefined;
}

export function PARSE(txt: string): RobotsTXTStruct {
  const content = txt
    .split(/\r?\n/)
    .filter((row) => row.match(/^[ -~]+$/gim))
    .join("\r\n");
  const groups = PARSE_GROUPS(content);
  const sitemaps = PARSE_SITEMAPS(content);
  const crawlDelay = CRAWL_DELAY(content);
  const host = PARSE_HOST(content);
  return { content, agents: groups, sitemaps, crawlDelay, host };
}

export function IS_ALLOWED(struct: RobotsTXTStruct, path: string, agent: string): boolean {
  let allowed = true;
  const agents = struct.agents;
  const list = Object.keys(agents).sort();

  const lowered = agent.toLowerCase();
  const activeGroup = list
    .filter((_agent) => {
      return lowered.indexOf(_agent) !== -1;
    })
    .reduce((acc, cur) => {
      // TODO: Why compare string length?
      if (acc.length < cur.length) acc = cur;
      return acc;
    }, "*");

  const g = agents[activeGroup] || [];

  const rules = g.sort((a, b) => {
    // TODO
    return a.path!.length - b.path!.length;
    // if (a.path && b.path) {
    // } else {
    //   return 0;
    // }
  });

  for (const rule of rules) {
    let p = (rule.path || "").trim();
    const directive = rule.instruction;

    if (p.length === 0) continue;
    if (p === "/") p = "/*";

    const pattern = p.replace(/\//gim, "\\/").replace(/\?/, "\\?").replace(/\*/gim, ".*");
    try {
      const reg = new RegExp(pattern, "ig");

      if (path.match(reg) && directive === "disallow") allowed = false;
      if (path.match(reg) && directive === "allow") allowed = true;
    } catch {
      // noop
    }
  }

  return allowed;
}

function PARSE_GROUPS(content: string): RobotsTXTAgentDict {
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

function PARSE_SITEMAPS(content: string) {
  const reg = /Sitemap: *([^\r\n]*)/gi;
  let match = reg.exec(content);

  const sitemaps: string[] = [];
  while (match != null) {
    sitemaps.push(match[1]);
    match = reg.exec(content);
  }
  return sitemaps;
}

function PARSE_HOST(content: string) {
  const reg = /host: *([^\r\n]*)/gi;
  const match = reg.exec(content);
  if (match) return match[1];
  return null;
}

function CRAWL_DELAY(content: string) {
  const reg = /crawl-delay: *([^\r\n]*)/gi;
  const match = reg.exec(content);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}
