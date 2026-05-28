/**
 * Utility function to convert any image file (PNG, JPEG, WebP, etc.) to a PNG file.
 * To avoid 413 Payload Too Large errors, it resizes the image if its dimensions
 * exceed a max dimension (e.g. 1600px) while maintaining the original aspect ratio.
 */
export function convertImageToPng(file: File, maxDimension: number = 1600): Promise<File> {
  return new Promise((resolve, reject) => {
    // If the file is not an image, return it unchanged.
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Always scale down if dimensions exceed the maximum allowed dimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to get canvas 2D context"));
        }

        // Draw image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas drawing to a PNG Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to convert canvas to Blob"));
            }

            // Generate a new file name with a .png extension
            const originalName = file.name;
            const lastDotIndex = originalName.lastIndexOf(".");
            const baseName =
              lastDotIndex !== -1
                ? originalName.substring(0, lastDotIndex)
                : originalName;
            const newName = `${baseName}.png`;

            // Create a new File object with type 'image/png'
            const pngFile = new File([blob], newName, {
              type: "image/png",
              lastModified: Date.now(),
            });
            resolve(pngFile);
          },
          "image/png"
        );
      };
      img.onerror = () => {
        reject(new Error("Failed to load image into element for PNG conversion"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("FileReader failed to read the image file"));
    };
    reader.readAsDataURL(file);
  });
}
