/**
 * Utilitário para redimensionar, achatar ou expandir imagens proporcionalmente
 * para dimensões exatas via HTML5 Canvas em Base64.
 */

export const resizeImageToTarget = (
  file: File,
  targetWidth: number,
  targetHeight: number,
  mode: 'contain' | 'cover' | 'stretch' = 'contain'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Habilita interpolação de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Limpa canvas com fundo transparente
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        if (mode === 'stretch') {
          // Achata ou expande exatamente para a largura e altura alvo
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        } else if (mode === 'contain') {
          // Mantém proporção centralizada dentro da área alvo
          const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (targetWidth - w) / 2;
          const y = (targetHeight - h) / 2;
          ctx.drawImage(img, x, y, w, h);
        } else if (mode === 'cover') {
          // Preenche todo o canvas cortando excesso
          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (targetWidth - w) / 2;
          const y = (targetHeight - h) / 2;
          ctx.drawImage(img, x, y, w, h);
        }

        // Retorna Base64 PNG otimizado
        resolve(canvas.toDataURL('image/png', 0.95));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
