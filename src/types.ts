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
