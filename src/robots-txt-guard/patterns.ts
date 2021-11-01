export type Pattern = {
  specificity: number;
  path: string;
  // test: (input: string) => boolean;
  regexp: RegExp;
};

function escapeRegExp(regexString: string): string {
  return regexString.replace(/[*/\-[\]{}()+?.,\\^$|#]/g, "\\$&");
}

export function makePathPattern(path: string): Pattern {
  let processed = path;
  const firstChar = processed[0];
  const lastChar = processed[processed.length - 1];
  const matchEnd = lastChar === "$";

  if (firstChar !== "/") {
    processed = "/" + processed;
  }

  if (processed.includes("*") || processed.endsWith("$")) {
    if (processed.endsWith("$")) {
      processed = processed.slice(0, -1);
    }

    // wildcards are ignored in specificity
    const specificityString = processed.replace(/\*/g, "");

    processed = processed.split(/\*+/).map(escapeRegExp).join("(?:.*)");

    processed = "^" + processed;
    if (matchEnd) {
      processed += "$";
    }

    const regexp = new RegExp(processed);

    return {
      path,
      specificity: specificityString.length,
      regexp,
    };
  } else {
    const regexp = new RegExp("^" + processed);
    return {
      path,
      specificity: processed.length,
      // test: (path: any) => path.startsWith(pattern),
      regexp,
    };
  }
}

export function makeUserAgentPattern(path: string): Pattern {
  let pattern = path;
  if (pattern === "*") {
    return {
      path,
      specificity: 0,
      regexp: /.*/, // match anything
    };
  }

  const specificityString = pattern;

  pattern = escapeRegExp(pattern);

  const regexp = new RegExp(pattern, "i");

  return {
    path,
    specificity: specificityString.length,
    regexp,
  };
}
