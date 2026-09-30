/**
 * Gerenciador universal de Favicon e Ícone de App PWA
 * Garante que abas do navegador, favoritos e atalhos na tela inicial do celular
 * reflitam dinamicamente a imagem customizada salva no sistema,
 * com auto-corte de bordas brancas para ficar GRANDE de ponta a ponta na aba.
 */
import { autoTrimCanvas } from './imageOptimizer';

export const updateBrowserFavicon = (iconUrl?: string) => {
  if (!iconUrl || iconUrl.trim() === '') {
    iconUrl = '/pwa-192x192.png';
  }

  // Se for uma imagem base64 ou url, prepara e garante que não tenha bordas brancas vazias
  const applyIconsToHead = (finalUrl: string) => {
    try {
      const head = document.head || document.getElementsByTagName('head')[0];

      // Remove todos os links de icon existentes para evitar retenção de cache
      const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
      existingIcons.forEach(el => el.parentNode?.removeChild(el));

      // 1. Favicon padrão (rel="icon")
      const linkIcon = document.createElement('link');
      linkIcon.type = finalUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png';
      linkIcon.rel = 'icon';
      linkIcon.href = finalUrl;
      head.appendChild(linkIcon);

      // 2. Shortcut icon (compatibilidade de navegadores Chromium/Edge/Firefox)
      const linkShortcut = document.createElement('link');
      linkShortcut.type = 'image/png';
      linkShortcut.rel = 'shortcut icon';
      linkShortcut.href = finalUrl;
      head.appendChild(linkShortcut);

      // 3. Apple Touch Icon (iOS Safari e tela inicial do celular)
      const linkApple = document.createElement('link');
      linkApple.rel = 'apple-touch-icon';
      linkApple.sizes = '180x180';
      linkApple.href = finalUrl;
      head.appendChild(linkApple);
    } catch (err) {
      console.warn('Erro ao atualizar favicon dinamicamente:', err);
    }
  };

  // Se for data:image, realiza corte das margens brancas para o símbolo preencher o favicon inteiro (estilo Google AI Studio)
  if (iconUrl.startsWith('data:image/')) {
    const img = new Image();
    img.onload = () => {
      try {
        const rawCanvas = document.createElement('canvas');
        rawCanvas.width = img.width;
        rawCanvas.height = img.height;
        const ctx = rawCanvas.getContext('2d');
        if (!ctx) {
          applyIconsToHead(iconUrl);
          return;
        }
        ctx.drawImage(img, 0, 0);

        // Corta bordas brancas ou transparentes para isolar o símbolo
        const trimmed = autoTrimCanvas(rawCanvas);

        // Gera ícone quadrado de 64x64 com o símbolo ocupando 100% da área
        const squareCanvas = document.createElement('canvas');
        squareCanvas.width = 64;
        squareCanvas.height = 64;
        const sqCtx = squareCanvas.getContext('2d');
        if (!sqCtx) {
          applyIconsToHead(iconUrl);
          return;
        }

        sqCtx.imageSmoothingEnabled = true;
        sqCtx.imageSmoothingQuality = 'high';
        sqCtx.clearRect(0, 0, 64, 64);

        const scale = Math.min(64 / trimmed.width, 64 / trimmed.height);
        const drawW = Math.round(trimmed.width * scale);
        const drawH = Math.round(trimmed.height * scale);
        const drawX = Math.round((64 - drawW) / 2);
        const drawY = Math.round((64 - drawH) / 2);

        sqCtx.drawImage(trimmed, drawX, drawY, drawW, drawH);
        const trimmedBase64 = squareCanvas.toDataURL('image/png', 1.0);
        applyIconsToHead(trimmedBase64);
      } catch {
        applyIconsToHead(iconUrl);
      }
    };
    img.onerror = () => applyIconsToHead(iconUrl);
    img.src = iconUrl;
  } else {
    applyIconsToHead(iconUrl);
  }
};
