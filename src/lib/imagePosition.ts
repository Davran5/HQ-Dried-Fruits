export interface ImagePosition {
  x: number;
  y: number;
}

export const DEFAULT_IMAGE_POSITION: ImagePosition = { x: 50, y: 50 };

const POSITION_HASH_PATTERN = /(?:^|[#&])xy=([0-9]{1,3}(?:\.[0-9]+)?),([0-9]{1,3}(?:\.[0-9]+)?)/i;

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function getImageUrl(value?: string | null) {
  if (!value) return "";
  return value.split("#")[0];
}

export function getImagePosition(value?: string | null): ImagePosition {
  if (!value) return DEFAULT_IMAGE_POSITION;

  const match = value.match(POSITION_HASH_PATTERN);
  if (!match) return DEFAULT_IMAGE_POSITION;

  return {
    x: clampPercent(Number(match[1])),
    y: clampPercent(Number(match[2])),
  };
}

export function getImageObjectPosition(value?: string | null) {
  const position = getImagePosition(value);
  return `${position.x}% ${position.y}%`;
}

export function withImagePosition(value: string, position: ImagePosition) {
  const url = getImageUrl(value).trim();
  if (!url) return "";

  const x = clampPercent(position.x);
  const y = clampPercent(position.y);
  return `${url}#xy=${x},${y}`;
}
