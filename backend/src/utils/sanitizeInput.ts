const HTML_TAG_REGEX = /<[^>]*>/g;
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SCRIPT_PROTOCOL_REGEX = /javascript:/gi;

export function sanitizeText(input: string): string {
  return input
    .replace(HTML_TAG_REGEX, "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(SCRIPT_PROTOCOL_REGEX, "")
    .trim();
}

export function trimAndLimit(input: string, maxLength: number): string {
  return sanitizeText(input).slice(0, maxLength);
}
