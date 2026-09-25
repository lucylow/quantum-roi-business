const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/i,
  /aws_secret_access_key/i,
  /secret(access)?key/i,
  /private[_-]?key/i,
  /bearer\s+[A-Za-z0-9._-]+/i,
];

export function containsSecretLikeText(value: string): boolean {
  return SECRET_PATTERNS.some(pattern => pattern.test(value));
}

export function redactSecretLikeText(value: string): string {
  let output = value;
  output = output.replace(/AKIA[0-9A-Z]{16}/gi, '[REDACTED-AWS-KEY]');
  output = output.replace(/bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');
  output = output.replace(/(secret(access)?key\s*[:=]\s*)[^\s,}]+/gi, '$1[REDACTED]');
  return output.slice(0, 2_000);
}

export function safeLogPayload(payload: unknown): string {
  try {
    return redactSecretLikeText(JSON.stringify(payload));
  } catch {
    return '[unserializable payload]';
  }
}
