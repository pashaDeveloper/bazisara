const windows1252: Record<string, number> = {
  "€": 0x80,
  "‚": 0x82,
  "ƒ": 0x83,
  "„": 0x84,
  "…": 0x85,
  "†": 0x86,
  "‡": 0x87,
  "ˆ": 0x88,
  "‰": 0x89,
  "Š": 0x8a,
  "‹": 0x8b,
  "Œ": 0x8c,
  "Ž": 0x8e,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95,
  "–": 0x96,
  "—": 0x97,
  "˜": 0x98,
  "™": 0x99,
  "š": 0x9a,
  "›": 0x9b,
  "œ": 0x9c,
  "ž": 0x9e,
  "Ÿ": 0x9f,
};

export function faText(value?: string | number | null) {
  const text = String(value ?? "");
  if (!text || /[\u0600-\u06ff]/.test(text)) return text;

  const bytes: number[] = [];
  for (const char of text) {
    const code = char.charCodeAt(0);
    const byte = windows1252[char] ?? (code <= 255 ? code : null);
    if (byte === null) return text;
    bytes.push(byte);
  }

  const decoded = new TextDecoder().decode(Uint8Array.from(bytes));
  return decoded.includes("�") ? text : decoded;
}
