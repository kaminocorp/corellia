/**
 * The two runtime helpers the precompiled validators (gen/validators.js)
 * need, so the generated module imports nothing from Ajv at runtime and
 * stays a plain ES module the browser bundle can load under a strict CSP.
 */

/** Code-point length (JSON Schema maxLength counts code points, not UTF-16 units). Same algorithm as ajv/dist/runtime/ucs2length (MIT). */
export function ucs2length(str: string): number {
  const len = str.length;
  let length = 0;
  let pos = 0;
  let value: number;
  while (pos < len) {
    length++;
    value = str.charCodeAt(pos++);
    if (value >= 0xd800 && value <= 0xdbff && pos < len) {
      value = str.charCodeAt(pos);
      if ((value & 0xfc00) === 0xdc00) pos++;
    }
  }
  return length;
}

/** RFC 3339 date-time (the "fast" check of ajv-formats): what the server's time.Time encodes. */
const DATE_TIME = /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i;

export const formats: Record<string, { validate: (s: string) => boolean }> = {
  "date-time": { validate: (s: string) => DATE_TIME.test(s) },
};
