/**
 * Utilitário para redimensionar, achatar ou expandir imagens proporcionalmente
 * para dimensões exatas via HTML5 Canvas em Base64.
 * Inclui algoritmo inteligente de recorte automático de margens vazias (Trim)
 * brancas ou transparentes para maximizar o aproveitamento do espaço.
 */

// Detecta se um pixel é considerado "fundo" (transparente ou quase branco)
const isBackgroundPixel = (r: number, g: number, b: number, a: number): boolean => {
  if (a < 15) return true; // Quase ou totalmente transparente
  // Quase totalmente branco (RGB > 248)
  if (r > 246 && g > 246 && b > 246) return true;
  return false;
};

// Corta automaticamente bordas vazias (brancas ou transparentes) de um canvas
export const autoTrimCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (!isBackgroundPixel(r, g, b, a)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Se a imagem inteira for fundo, retorna original
  if (minX > maxX || minY > maxY) {
    return sourceCanvas;
  }

  // Adiciona pequena folga de segurança de 2px
  minX = Math.max(0, minX - 2);
  minY = Math.max(0, minY - 2);
  maxX = Math.min(w - 1, maxX + 2);
  maxY = Math.min(h - 1, maxY + 2);

  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;

  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (!trimmedCtx) return sourceCanvas;

  trimmedCtx.drawImage(
    sourceCanvas,
    minX, minY, trimmedWidth, trimmedHeight,
    0, 0, trimmedWidth, trimmedHeight
  );

  return trimmedCanvas;
};

export const resizeImageToTarget = (
  file: File,
  targetWidth: number,
  targetHeight: number,
  mode: 'contain' | 'cover' | 'stretch' | 'contain-right' | 'favicon-square' = 'contain'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Passo 1: desenha a imagem original para aplicar auto-trim de margens brancas/vazias
        const rawCanvas = document.createElement('canvas');
        rawCanvas.width = img.width;
        rawCanvas.height = img.height;
        const rawCtx = rawCanvas.getContext('2d');
        if (!rawCtx) {
          resolve(e.target?.result as string);
          return;
        }
        rawCtx.drawImage(img, 0, 0);

        // Aplica o corte automático de margens vazias
        const trimmed = autoTrimCanvas(rawCanvas);

        // Modo especial para FAVICON: preenche com imponência de borda a borda (como o Google AI Studio)
        if (mode === 'favicon-square') {
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = targetWidth;
          finalCanvas.height = targetHeight;
          const finalCtx = finalCanvas.getContext('2d');
          if (!finalCtx) {
            resolve(e.target?.result as string);
            return;
          }
          finalCtx.imageSmoothingEnabled = true;
          finalCtx.imageSmoothingQuality = 'high';
          finalCtx.clearRect(0, 0, targetWidth, targetHeight);

          // Escala para ocupar praticamente 100% da área quadrada (com margem mínima de 4% apenas)
          const availableSize = targetWidth * 0.96;
          const scale = Math.min(availableSize / trimmed.width, availableSize / trimmed.height);
          const drawW = Math.round(trimmed.width * scale);
          const drawH = Math.round(trimmed.height * scale);
          const drawX = Math.round((targetWidth - drawW) / 2);
          const drawY = Math.round((targetHeight - drawH) / 2);

          finalCtx.drawImage(trimmed, drawX, drawY, drawW, drawH);
          resolve(finalCanvas.toDataURL('image/png', 0.98));
          return;
        }

        // Modo para LOGO DE CABEÇALHO / TIMBRADO: sem margens brancas verticais
        if (mode === 'contain-right') {
          // Mantém proporção e escala para caber em targetHeight ou targetWidth
          const scale = Math.min(targetWidth / trimmed.width, targetHeight / trimmed.height, 2.0);
          const finalW = Math.round(trimmed.width * scale);
          const finalH = Math.round(trimmed.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = finalW;
          canvas.height = finalH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.clearRect(0, 0, finalW, finalH);
          ctx.drawImage(trimmed, 0, 0, finalW, finalH);
          resolve(canvas.toDataURL('image/png', 0.98));
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        if (mode === 'stretch') {
          ctx.drawImage(trimmed, 0, 0, targetWidth, targetHeight);
        } else if (mode === 'contain') {
          const scale = Math.min(targetWidth / trimmed.width, targetHeight / trimmed.height);
          const w = trimmed.width * scale;
          const h = trimmed.height * scale;
          const x = (targetWidth - w) / 2;
          const y = (targetHeight - h) / 2;
          ctx.drawImage(trimmed, x, y, w, h);
        } else if (mode === 'cover') {
          const scale = Math.max(targetWidth / trimmed.width, targetHeight / trimmed.height);
          const w = trimmed.width * scale;
          const h = trimmed.height * scale;
          const x = (targetWidth - w) / 2;
          const y = (targetHeight - h) / 2;
          ctx.drawImage(trimmed, x, y, w, h);
        }

        resolve(canvas.toDataURL('image/png', 0.98));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compacta uma foto de alimentação para reduzir o consumo de espaço e 
 * evitar erros de payload no servidor (413).
 * Converte para JPEG com qualidade balanceada (0.6) e redimensiona 
 * se for maior que 1280px (HD).
 */
export const compressImage = (file: File, maxWidth: number = 1280): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensiona se ultrapassar o limite máximo (HD)
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para JPEG com qualidade 0.6 (60%) - Reduz significativamente o tamanho sem perder legibilidade clínica
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
