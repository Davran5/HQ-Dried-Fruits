import type { ImgHTMLAttributes } from "react";
import { getImageObjectPosition, getImageUrl } from "@/src/lib/imagePosition";

interface PositionedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
}

export function PositionedImage({ src, style, ...props }: PositionedImageProps) {
  return (
    <img
      {...props}
      src={getImageUrl(src)}
      style={{ ...style, objectPosition: getImageObjectPosition(src) }}
    />
  );
}
