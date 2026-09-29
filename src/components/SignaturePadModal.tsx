import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, ShieldCheck, MapPin, Globe, Clock, User, AlertCircle } from 'lucide-react';
import { getClientPublicIp, getGeolocationString } from '../utils/signatureAudit';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  signerName: string;
  signerRole: 'fonoaudiologo' | 'cuidador' | 'familiar' | 'paciente' | 'admin';
  signerDocument?: string;
  signerEmail?: string;
  defaultSignatureUrl?: string; // Rubrica pré-cadastrada da clínica
  onConfirmSignature: (signatureDataUrl: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  signerName,
  signerRole,
  signerDocument,
  signerEmail,
  defaultSignatureUrl,
  onConfirmSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [useDefaultSignature, setUseDefaultSignature] = useState(false);
  const [currentIp, setCurrentIp] = useState<string>('Carregando IP...');
  const [currentLocation, setCurrentLocation] = useState<string>('Detectando localização...');
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTimestamp(new Date().toLocaleString('pt-BR'));
      getClientPublicIp().then(ip => setCurrentIp(ip));
      getGeolocationString().then(loc => setCurrentLocation(loc));

      // Se tiver assinatura pré-cadastrada e for Fonoaudióloga, sugere inicialmente
      if (defaultSignatureUrl && signerRole === 'fonoaudiologo') {
        setUseDefaultSignature(true);
      } else {
        setUseDefaultSignature(false);
      }
      setHasDrawn(false);
    }
  }, [isOpen, defaultSignatureUrl, signerRole]);

  // Setup Canvas
  useEffect(() => {
    if (!isOpen || useDefaultSignature) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolução nítida para Retina / Mobile
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#181513';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen, useDefaultSignature]);

  if (!isOpen) return null;

  // Handlers de Desenho Touch & Mouse
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    if (useDefaultSignature && defaultSignatureUrl) {
      onConfirmSignature(defaultSignatureUrl);
      onClose();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      alert('Por favor, faça a sua assinatura ou rubrica no quadro antes de confirmar.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    onConfirmSignature(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1f1a17] border border-[#3e342e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 animate-in fade-in duration-200">
        
        {/* Header do Modal */}
        <div className="flex items-start justify-between border-b border-[#342b26] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c8a88a]/15 text-[#c8a88a] border border-[#c8a88a]/30">
                Assinatura Eletrônica Qualificada
              </span>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#f4efe8] mt-0.5">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-[#a69a8f]">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Quadro de Auditoria / Dados do Signatário */}
        <div className="bg-[#181513] border border-[#2e2621] rounded-xl p-3.5 space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#d8cec4]">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#c8a88a] shrink-0" />
              <span className="truncate"><strong>Signatário:</strong> {signerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#c8a88a] shrink-0" />
              <span className="truncate"><strong>Data/Hora:</strong> {timestamp}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Globe className="w-3.5 h-3.5 text-[#c8a88a] shrink-0" />
              <span className="truncate"><strong>IP de Rede:</strong> {currentIp}</span>
            </div>
          </div>
          {signerDocument && (
            <p className="text-[11px] text-[#a69a8f] pt-1 border-t border-[#2a221d]">
              Documento/Registro: <strong className="text-[#f4efe8]">{signerDocument}</strong> {signerEmail && `• E-mail: ${signerEmail}`}
            </p>
          )}
        </div>

        {/* Opção de Rubrica Pré-Cadastrada (se houver) */}
        {defaultSignatureUrl && signerRole === 'fonoaudiologo' && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#261f1b] border border-[#3e342e]">
            <span className="text-xs text-[#f4efe8] font-medium">Usar rubrica digital cadastrada no perfil</span>
            <button
              type="button"
              onClick={() => setUseDefaultSignature(!useDefaultSignature)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                useDefaultSignature 
                  ? 'bg-[#c8a88a] text-[#181513]' 
                  : 'bg-[#181513] text-[#a69a8f] border border-[#3e342e]'
              }`}
            >
              {useDefaultSignature ? 'Usando Cadastrada' : 'Desenhar Nova'}
            </button>
          </div>
        )}

        {/* Área de Desenho da Assinatura Touch/Mouse */}
        {useDefaultSignature && defaultSignatureUrl ? (
          <div className="p-4 rounded-xl bg-white flex flex-col items-center justify-center border-2 border-dashed border-[#c8a88a] min-h-[140px]">
            <img src={defaultSignatureUrl} alt="Rubrica Pré-cadastrada" className="max-h-20 object-contain" />
            <span className="text-[10px] text-gray-500 mt-2 font-mono">Rubrica Oficial Registrada no Perfil</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#a69a8f]">
              <span>Desenhe sua assinatura ou rubrica abaixo (touch ou mouse):</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" /> Limpar quadro
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#5a483c] bg-[#faf8f5]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 cursor-crosshair touch-none"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-gray-400 text-xs">
                  <span>Assine aqui com o dedo ou mouse</span>
                  <div className="w-48 h-px bg-gray-300 mt-6" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Termo de Conformidade */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#27211d] text-[11px] text-[#a69a8f] leading-relaxed">
          <AlertCircle className="w-4 h-4 text-[#c8a88a] shrink-0 mt-0.5" />
          <span>
            Ao confirmar, declaro que as informações e condutas descritas neste atendimento são verídicas e correspondem ao atendimento prestado nesta data, sob as penas da lei.
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#342b26]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#261f1b] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#f4efe8] text-xs font-semibold border border-[#3e342e] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Assinatura Digital</span>
          </button>
        </div>
      </div>
    </div>
  );
};
