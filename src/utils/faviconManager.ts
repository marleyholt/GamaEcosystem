/**
 * Gerenciador universal de Favicon e Ícone de App PWA
 * Garante que abas do navegador, favoritos e atalhos na tela inicial do celular
 * reflitam dinamicamente a imagem customizada salva no sistema.
 */

export const updateBrowserFavicon = (iconUrl?: string) => {
  if (!iconUrl || iconUrl.trim() === '') {
    iconUrl = '/pwa-192x192.png';
  }

  try {
    const head = document.head || document.getElementsByTagName('head')[0];

    // Remove todos os links de icon existentes para evitar cache rígido
    const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
    existingIcons.forEach(el => el.parentNode?.removeChild(el));

    // 1. Favicon padrão (rel="icon")
    const linkIcon = document.createElement('link');
    linkIcon.type = iconUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png';
    linkIcon.rel = 'icon';
    linkIcon.href = iconUrl;
    head.appendChild(linkIcon);

    // 2. Shortcut icon (compatibilidade legada)
    const linkShortcut = document.createElement('link');
    linkShortcut.type = 'image/png';
    linkShortcut.rel = 'shortcut icon';
    linkShortcut.href = iconUrl;
    head.appendChild(linkShortcut);

    // 3. Apple Touch Icon (iOS Safari e tela inicial)
    const linkApple = document.createElement('link');
    linkApple.rel = 'apple-touch-icon';
    linkApple.sizes = '180x180';
    linkApple.href = iconUrl;
    head.appendChild(linkApple);
  } catch (err) {
    console.warn('Erro ao atualizar favicon dinamicamente:', err);
  }
};
