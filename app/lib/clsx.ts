type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[];

export function clsx(...inputs: ClassValue[]): string {
  let result = "";

  for (const input of inputs) {
    if (input) {
      const type = typeof input;

      if (type === "string" || type === "number") {
        result += " " + input;
      } else if (Array.isArray(input)) {
        const innerResult = clsx(...input);
        if (innerResult) {
          result += " " + innerResult;
        }
      } else if (type === "object") {
        for (const key in input as Record<string, any>) {
          if (
            Object.prototype.hasOwnProperty.call(input, key) &&
            (input as Record<string, any>)[key]
          ) {
            result += " " + key;
          }
        }
      }
    }
  }

  return result.trim();
}
