export type RobotsTXTAgentDirective = {
  instruction: string;
  path?: string;
};

export type RobotsTXTAgentDict = Record<string, RobotsTXTAgentDirective[]>;

export interface RobotsTXTStruct {
  readonly content: string;
  readonly agents: RobotsTXTAgentDict;
  readonly sitemaps: string[];
  readonly crawlDelay: number | null | undefined;
  readonly host: string | null | undefined;
}
