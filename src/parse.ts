import { PARSE_GROUPS, PARSE_SITEMAPS, CRAWL_DELAY, PARSE_HOST } from "./parsers";
import { RobotsTXTStruct } from "./types";

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

  for (let index = 0; index < rules.length; index++) {
    const rule = rules[index]!;
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
