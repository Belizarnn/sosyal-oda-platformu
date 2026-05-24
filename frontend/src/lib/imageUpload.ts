const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const DEFAULT_MAX_BYTES = 400_000;

interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxBytes?: number;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("invalid-image"));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("invalid-type");
  }

  const maxWidth = options.maxWidth ?? 512;
  const maxHeight = options.maxHeight ?? 512;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  const image = await loadImageFromFile(file);
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("canvas-unavailable");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = 0.9;
  let blob = await canvasToBlob(canvas, quality);

  while (blob && blob.size > maxBytes && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob || blob.size > maxBytes) {
    throw new Error("too-large");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("read-failed"));
      }
    };

    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

export { ALLOWED_IMAGE_TYPES };
