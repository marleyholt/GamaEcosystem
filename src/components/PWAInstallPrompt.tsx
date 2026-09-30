import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Bell, CheckCircle2, Share } from 'lucide-react';
import { requestNotificationPermission, sendLocalNotification } from '../services/pwaService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Verifica se já está rodando como app standalone (instalado)
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode);

    // Detecta se é iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Verifica status de permissão de notificação
    if ('Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted');
    }

    // Intercepta evento de instalação no Android/Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Se não estiver em modo standalone e o usuário ainda não fechou recentemente
      const dismissed = localStorage.getItem('gamaeco_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Se for iOS e não estiver instalado, mostra o convite após 3 segundos
    if (isIosDevice && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('gamaeco_pwa_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    // Não incomodar por 7 dias
    localStorage.setItem('gamaeco_pwa_dismissed', Date.now().toString());
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    if (granted) {
      sendLocalNotification('GamaEcosystem Ativo!', {
        body: 'Notificações de lembretes e registros clínicos ativadas com sucesso.'
      });
    }
  };

  // Se já está instalado e rodando standalone, apenas disponibiliza ativação de notificações se pendente
  if (isStandalone) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#1f1a17]/95 backdrop-blur-md border border-[#c8a88a]/40 p-4 rounded-2xl shadow-2xl space-y-3">
        {/* Header do Banner */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c8a88a] to-[#a88668] flex items-center justify-center text-[#181513] font-bold shadow-md shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#f4efe8] flex items-center gap-1.5">
                Instalar Aplicativo
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-[#c8a88a]/20 text-[#c8a88a] border border-[#c8a88a]/30">
                  PWA
                </span>
              </h4>
              <p className="text-xs text-[#a69a8f]">
                Acesse o GamaEcosystem com um clique na tela inicial do seu celular.
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismiss} 
            className="text-[#a69a8f] hover:text-[#f4efe8] p-1 rounded-lg hover:bg-[#2c2420] transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instruções específicas para iOS (iPhone/iPad) */}
        {showIOSInstructions ? (
          <div className="p-3 rounded-xl bg-[#28211c] border border-[#44362d] text-xs text-[#d1c7bc] space-y-2">
            <p className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
              <Share className="w-3.5 h-3.5 text-[#c8a88a]" />
              Como instalar no Safari (iPhone):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#a69a8f]">
              <li>Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).</li>
              <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
              <li>Confirme clicando em <strong>Adicionar</strong> no canto superior.</li>
            </ol>
          </div>
        ) : null}

        {/* Ações */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bc9f] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Ver Como Instalar' : 'Instalar Agora'}</span>
          </button>

          {!notificationEnabled && (
            <button
              onClick={handleEnableNotifications}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2c2420] hover:bg-[#3a302b] text-[#c8a88a] border border-[#44362d] font-semibold text-xs transition-all cursor-pointer shrink-0"
              title="Ativar lembretes e notificações"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notificações</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
