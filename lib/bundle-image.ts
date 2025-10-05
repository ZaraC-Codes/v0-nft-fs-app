/**
 * Generate a composite bundle image with FS logo background and 3 NFT thumbnails
 * Returns a base64 data URI
 */
export async function generateBundleImage(
  thumbnails: Array<{ image: string; name: string }>
): Promise<string> {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size (standard NFT size)
  const width = 800;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  // Draw gradient background (purple-black cyberpunk theme)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#581c87'); // purple-900
  gradient.addColorStop(0.5, '#000000'); // black
  gradient.addColorStop(1, '#1e3a8a'); // blue-900
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Load and draw FS logo in center (watermark style)
  const logoImage = await loadImage('/fs-temp-logo.png');
  const logoSize = 300;
  const logoX = (width - logoSize) / 2;
  const logoY = (height - logoSize) / 2;

  ctx.globalAlpha = 0.2; // 20% opacity for watermark
  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
  ctx.globalAlpha = 1.0; // Reset opacity

  // Draw 3 thumbnail NFTs at bottom
  const thumbSize = 180;
  const thumbSpacing = 20;
  const totalThumbWidth = (thumbSize * 3) + (thumbSpacing * 2);
  const thumbStartX = (width - totalThumbWidth) / 2;
  const thumbY = height - thumbSize - 40;

  for (let i = 0; i < Math.min(3, thumbnails.length); i++) {
    const thumbnail = thumbnails[i];
    const thumbX = thumbStartX + (i * (thumbSize + thumbSpacing));

    try {
      const thumbImage = await loadImage(thumbnail.image);

      // Draw white border/shadow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(thumbX, thumbY, thumbSize, thumbSize);

      // Draw thumbnail
      ctx.shadowBlur = 0;
      ctx.drawImage(thumbImage, thumbX, thumbY, thumbSize, thumbSize);
    } catch (error) {
      console.warn(`Failed to load thumbnail ${i}:`, error);
      // Draw placeholder if image fails to load
      ctx.fillStyle = '#1f2937'; // gray-800
      ctx.fillRect(thumbX, thumbY, thumbSize, thumbSize);
      ctx.fillStyle = '#9ca3af'; // gray-400
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`#${i + 1}`, thumbX + thumbSize / 2, thumbY + thumbSize / 2);
    }
  }

  // Convert canvas to base64 data URI
  return canvas.toDataURL('image/png');
}

/**
 * Helper to load an image and return a promise
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });
}

/**
 * Upload bundle image to IPFS (placeholder - implement when ready)
 * For now, returns the data URI directly
 */
export async function uploadBundleImageToIPFS(imageDataUri: string): Promise<string> {
  // TODO: Implement IPFS upload
  // For now, just return the data URI
  // In production, upload to IPFS and return ipfs:// URL
  console.log('📸 Bundle image generated (data URI)');
  return imageDataUri;
}
