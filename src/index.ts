// @ts-expect-error Missing types
import guard from "robots-txt-guard";

const START_GROUP = 1 as const;
const GROUP_MEMBER = 2 as const;
const NON_GROUP = 0 as const;

export type Rule = {
  rule: string;
  path: string;
};
export type Group = {
  agents: string[];
  rules: Rule[];
};
export type Extension = {
  extension: string;
  value: string;
};

type TokenStart = {
  type: 1;
  agent: string;
};
type TokenMember = {
  type: 2;
  rule: string;
  path: string;
};
type TokenNon = {
  type: 0;
  field: string;
  value: string;
};
type Token = TokenStart | TokenMember | TokenNon;

function PARSE_LINE(line: string): Token | null {
  const commentFree = line.replace(/#.*$/, "");
  const index = commentFree.indexOf(":");

  if (index === -1) return null;

  const field = commentFree.substr(0, index).trim().toLowerCase();
  const value = commentFree.substr(index + 1).trim();

  switch (field) {
    case "user-agent":
      return {
        type: START_GROUP,
        agent: value,
      };
    case "allow":
    case "disallow":
    case "noindex":
      return {
        type: GROUP_MEMBER,
        rule: field,
        path: value,
      };
    default:
      return {
        type: NON_GROUP,
        field: field,
        value: value,
      };
  }
}

export function PARSE(txt: string) {
  const content = txt
    .split(/\r?\n/)
    .filter((row) => row.match(/^[ -~]+$/gim))
    .join("\r\n");

  const result = {
    groups: [] as Group[],
    extensions: [] as Extension[],
  };

  let prevToken: number | null = null;
  let currentGroup: Group | null = null;

  const lines = content.split(/\r?\n/);
  const len = lines.length;
  for (let i = 0; i < len; i++) {
    const line = lines[i];
    const token = PARSE_LINE(line);
    if (!token) continue;

    if (token.type === START_GROUP) {
      if (prevToken !== START_GROUP) {
        const group: Group = {
          agents: [],
          rules: [],
        };
        currentGroup = group;
        result.groups.push(group);
      }
      if (currentGroup) {
        currentGroup.agents.push(token.agent);
      }
    } else if (token.type === GROUP_MEMBER) {
      if (currentGroup) {
        currentGroup.rules.push({
          rule: token.rule,
          path: token.path,
        });
      }
    } else {
      result.extensions.push({
        extension: token.field,
        value: token.value,
      });
    }

    prevToken = token.type;
  }
  return result;
}

export function GUARD(groups: Group[]) {
  const instance = guard({ groups });
  return {
    isAllowed(path: string, useragent = "*"): boolean {
      return instance.isAllowed(useragent, path);
    },
    isIndexable(path: string, useragent = "*"): boolean {
      return instance.isIndexable(useragent, path);
    },
    isDisallowAll(useragent = "*"): boolean {
      return instance.isDisallowAll(useragent);
    },
  };
}
