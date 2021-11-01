import type { Group } from "../types";
import { makePathPattern, makeUserAgentPattern, Pattern } from "./patterns";

export type GuardRule = {
  pattern: Pattern;
  allow: boolean;
};
type RuleGroup = {
  pattern: Pattern;
  access: GuardRule[];
  index: GuardRule[];
};

function moreSpecificFirst(obj1: { pattern: Pattern }, obj2: { pattern: Pattern }): number {
  return obj2.pattern.specificity - obj1.pattern.specificity;
}

export function makeGuard(config: Group[]) {
  const groups: RuleGroup[] = [];

  for (const group of config) {
    // flatten agents

    const allowByPath: Record<string, "allow" | "disallow"> = {};

    for (const { rule, path } of group.rules) {
      const normalizedRule = rule.toLowerCase();
      if (path && (normalizedRule === "allow" || normalizedRule === "disallow")) {
        const repeatedPath = allowByPath[path];
        const overwrite = repeatedPath && normalizedRule === "allow";
        if (overwrite || !repeatedPath) {
          allowByPath[path] = normalizedRule;
        }
      }
    }

    const access: GuardRule[] = [];
    for (const [path, rule] of Object.entries(allowByPath)) {
      access.push({
        pattern: makePathPattern(path),
        allow: rule !== "disallow",
      });
    }

    access.sort(moreSpecificFirst);

    const index: GuardRule[] = [];
    for (const { rule, path } of group.rules) {
      const normalizedRule = rule.toLowerCase();
      if (path && normalizedRule === "noindex") {
        index.push({
          pattern: makePathPattern(path),
          allow: false,
        });
      }
    }

    index.sort(moreSpecificFirst);

    for (const agent of group.agents) {
      groups.push({
        pattern: makeUserAgentPattern(agent),
        access,
        index,
      });
    }
  }

  groups.sort(moreSpecificFirst);

  function findGroup(userAgent: string | undefined | null): RuleGroup | undefined {
    return groups.find((group) => group.pattern.regexp.test(userAgent || "*"));
  }

  function matchRuleBy(rules: GuardRule[], path: string): GuardRule | undefined {
    return rules.find((rule) => rule.pattern.regexp.test(path));
  }
  function isRuleSetAllowedBy(
    ruleSet: "access" | "index",
    path: string,
    userAgent?: string | undefined | null,
  ): GuardRule | undefined {
    const group = findGroup(userAgent);
    if (group) {
      return matchRuleBy(group[ruleSet], path);
    }
    return undefined;
  }

  function isAllowedBy(path: string, userAgent?: string | null | undefined): GuardRule | undefined {
    return isRuleSetAllowedBy("access", path, userAgent);
  }

  function isIndexableBy(path: string, userAgent?: string | null | undefined) {
    return isRuleSetAllowedBy("index", path, userAgent);
  }

  function isDisallowAll(userAgent: string | undefined | null) {
    const group = findGroup(userAgent);
    if (group) {
      const allowRules = group.access.filter(({ pattern, allow }) => {
        return allow || pattern.specificity > 1;
      });
      return allowRules.length <= 0;
    }
    // no group matched? assume allowed
    return false;
  }

  return {
    isIndexableBy,
    isAllowedBy,
    isDisallowAll,
  };
}
