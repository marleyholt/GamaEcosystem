import React, { useState, useRef } from 'react';
import { 
  Patient, 
  DailyFeedingLog, 
  MealPhoto, 
  MealType, 
  UserProfile 
} from '../types';
import { 
  IDDSI_FOOD_LEVELS, 
  IDDSI_LIQUID_LEVELS, 
  SYMPTOMS_LIST, 
  INITIAL_MEAL_PHOTOS 
} from '../data/mockData';
import { 
  Utensils, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Info, 
  ArrowLeft, 
  Calendar, 
  Save, 
  Lock 
} from 'lucide-react';

interface DailyFeedingLogViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  currentUser: UserProfile;
  onSaveLog: (log: DailyFeedingLog) => void;
  allPhotos: MealPhoto[];
  onAddPhoto: (photo: MealPhoto) => void;
  onDeletePhoto: (photoId: string) => void;
}

export const DailyFeedingLogView: React.FC<DailyFeedingLogViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  currentUser,
  onSaveLog,
  allPhotos,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(selectedPatient);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Consistency selections
  const [selectedFood, setSelectedFood] = useState<string>('Macio e Picado');
  const [selectedFoodLevel, setSelectedFoodLevel] = useState<number>(6);
  const [selectedLiquid, setSelectedLiquid] = useState<string>('Extremamente Espessado');
  const [selectedLiquidLevel, setSelectedLiquidLevel] = useState<number>(4);
  const [liquidBrandDose, setLiquidBrandDose] = useState<string>('1 colher-medida para 100ml de líquido fino');
  
  // Symptoms checklist
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['degluticao_lenta']);
  const [observations, setObservations] = useState<string>('');

  // Photo upload states
  const [currentMealType, setCurrentMealType] = useState<MealType>('almoço');
  const [photoNote, setPhotoNote] = useState<string>('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Role simulation toggle for testing (Mode Cuidador vs Fonoaudiólogo)
  const [isCaregiverMode, setIsCaregiverMode] = useState<boolean>(currentUser.role === 'cuidador');

  // If no patient picked
  if (!activePatient) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Selecionar Paciente para Registro Diário
          </h2>
          <p className="text-sm text-[#a69a8f] mt-1">
            Escolha qual paciente deseja realizar o registro diário de alimentação
          </p>
        </div>

        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#342b26] flex items-center justify-center text-[#c8a88a] font-bold">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#f4efe8] text-base">{patient.name}</h3>
                  <p className="text-xs text-[#a69a8f]">
                    Diagnóstico: <span className="text-[#f4efe8]">{patient.diagnosis}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePatient(patient);
                  onSelectPatient(patient);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-semibold text-sm transition-colors text-center"
              >
                Iniciar Registro Diário
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const patientPhotos = allPhotos.filter(p => p.patientId === activePatient.id);

  const toggleSymptom = (symptomId: string) => {
    if (isCaregiverMode && currentUser.role === 'cuidador') return; // Read-only for strict caregiver
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: MealPhoto = {
        id: `photo_${Date.now()}`,
        patientId: activePatient.id,
        mealType: currentMealType,
        photoUrl: reader.result as string,
        date: logDate,
        notes: photoNote || `Foto de ${currentMealType}`,
        uploadedAt: new Date().toISOString()
      };
      onAddPhoto(newPhoto);
      setPhotoNote('');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const newLog: DailyFeedingLog = {
      id: `log_${Date.now()}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      caregiverId: currentUser.id,
      caregiverName: currentUser.name,
      date: logDate,
      foodConsistency: `${selectedFood} (Nível ${selectedFoodLevel})`,
      foodConsistencyLevel: selectedFoodLevel,
      liquidConsistency: `${selectedLiquid} (Nível ${selectedLiquidLevel})`,
      liquidConsistencyLevel: selectedLiquidLevel,
      liquidBrandDose,
      symptoms: selectedSymptoms,
      observations,
      photos: patientPhotos.filter(p => p.date === logDate),
      createdAt: new Date().toISOString(),
      isEncrypted: true
    };

    onSaveLog(newLog);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActivePatient(null)}
            className="flex items-center gap-1.5 text-xs text-[#a69a8f] hover:text-[#f4efe8] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para lista de pacientes
          </button>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Registro Diário - {activePatient.name}
          </h2>
          <p className="text-xs text-[#a69a8f]">
            Registre as observações sobre a alimentação do dia
          </p>
        </div>

        {/* Date Selector Box (Matching video at 01:07) */}
        <div className="bg-[#221d1a] border border-[#3a312c] rounded-xl px-4 py-2 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#c8a88a]" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#a69a8f] block font-semibold">
              Data do Registro
            </span>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#f4efe8] focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Modo Cuidador / Fonoaudiólogo Banner (Matching video at 01:07) */}
      <div className="p-4 rounded-xl bg-[#2a221b] border border-[#4d3a2b] flex items-start justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#c8a88a] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#f4efe8]">
              {isCaregiverMode ? 'Modo Cuidador Ativo' : 'Modo Fonoaudiólogo / Nutricionista'}
            </p>
            <p className="text-[#a69a8f] mt-0.5">
              {isCaregiverMode 
                ? 'Você pode anexar fotos da alimentação. As informações técnicas (consistências IDDSI, sintomas, prescrições) são preenchidas ou autorizadas por fonoaudiólogos.'
                : 'Acesso completo com autorização para alteração de consistências IDDSI, prescrição de espessantes e sintomas clínicos.'}
            </p>
          </div>
        </div>

        {/* Quick toggle for demonstration */}
        <button
          onClick={() => setIsCaregiverMode(!isCaregiverMode)}
          className="text-[11px] px-2.5 py-1 rounded bg-[#382b21] hover:bg-[#4a392d] text-[#c8a88a] whitespace-nowrap shrink-0 border border-[#524134]"
        >
          {isCaregiverMode ? 'Alternar para Fono' : 'Alternar para Cuidador'}
        </button>
      </div>

      {/* Consistência das Ingestas Orais Oferecidas (Matching video at 01:08) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
            Consistência das Ingestas Orais Oferecidas
          </h3>
          <p className="text-xs text-[#a69a8f] mt-0.5">
            {isCaregiverMode ? (
              <span className="text-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3 inline" /> Somente fonoaudiólogos e nutricionistas podem alterar esta seção
              </span>
            ) : (
              'Classificação oficial de texturas e viscosidades segundo o framework IDDSI'
            )}
          </p>
        </div>

        {/* Alimento */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a69a8f]">
            Alimento
          </span>
          <div className="space-y-2">
            {IDDSI_FOOD_LEVELS.map((item, idx) => {
              const isSelected = selectedFood === item.name;
              return (
                <button
                  key={`${item.name}-${idx}`}
                  type="button"
                  disabled={isCaregiverMode}
                  onClick={() => {
                    setSelectedFood(item.name);
                    setSelectedFoodLevel(item.level);
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-[#2c2420] border-[#c8a88a] ring-1 ring-[#c8a88a]'
                      : 'bg-[#1e1917] border-[#342b26] hover:bg-[#251f1c]'
                  } ${isCaregiverMode ? 'opacity-85 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#c8a88a] bg-[#c8a88a]' : 'border-[#61544a]'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#181513]" />}
                    </span>
                    <span className="text-sm font-medium text-[#f4efe8]">{item.name}</span>
                  </div>

                  {/* Level Badge matching video */}
                  <span
                    className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.level}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Líquidos */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a69a8f]">
            Líquidos
          </span>
          <div className="space-y-2">
            {IDDSI_LIQUID_LEVELS.map((item, idx) => {
              const isSelected = selectedLiquid === item.name;
              return (
                <button
                  key={`${item.name}-${idx}`}
                  type="button"
                  disabled={isCaregiverMode}
                  onClick={() => {
                    setSelectedLiquid(item.name);
                    setSelectedLiquidLevel(item.level);
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-[#2c2420] border-[#c8a88a] ring-1 ring-[#c8a88a]'
                      : 'bg-[#1e1917] border-[#342b26] hover:bg-[#251f1c]'
                  } ${isCaregiverMode ? 'opacity-85 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#c8a88a] bg-[#c8a88a]' : 'border-[#61544a]'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#181513]" />}
                    </span>
                    <span className="text-sm font-medium text-[#f4efe8]">{item.name}</span>
                  </div>

                  {/* Level Badge matching video */}
                  <span
                    className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ 
                      backgroundColor: item.color,
                      color: item.level === 0 ? '#181513' : '#ffffff'
                    }}
                  >
                    {item.level}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Marca e Indicação de Espessante (Matching video at 01:09) */}
        <div className="space-y-2 pt-2 border-t border-[#342b26]">
          <label className="text-xs font-semibold text-[#f4efe8] block">
            Descreva marca e indicação de Consistência de líquidos
          </label>
          <input
            type="text"
            disabled={isCaregiverMode}
            value={liquidBrandDose}
            onChange={(e) => setLiquidBrandDose(e.target.value)}
            placeholder="Ex: 1 colher medida ou sachê para 100 ml de líquido fino"
            className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-3 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a] disabled:opacity-75"
          />
        </div>
      </div>

      {/* Sintomas Observados (Checkboxes matching video at 01:09 - 01:10) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
            Sintomas Observados
          </h3>
          <p className="text-xs text-[#a69a8f]">
            Marque todos os sintomas observados durante a alimentação
          </p>
        </div>

        <div className="space-y-2.5">
          {SYMPTOMS_LIST.map((symptom) => {
            const isChecked = selectedSymptoms.includes(symptom.id);
            return (
              <label
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                  isChecked 
                    ? 'bg-[#2d2420] border-[#c8a88a]/70 text-[#f4efe8]' 
                    : 'bg-[#1e1917] border-[#342b26] text-[#a69a8f] hover:bg-[#251f1c]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // handled by label click
                  className="w-4 h-4 rounded border-[#4a3e37] bg-[#181513] text-[#c8a88a] focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-lg leading-none">{symptom.emoji}</span>
                <span className="text-sm font-medium">{symptom.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Observações Adicionais (Matching video at 01:10) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-2">
        <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
          Observações Adicionais
        </h3>
        <p className="text-xs text-[#a69a8f]">
          Descreva detalhes sobre a alimentação, comportamento, ambiente, medicamentos, etc...
        </p>
        <textarea
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Ex: Paciente alimentou-se com boa aceitação em posição sentada a 90°. Sem tosse."
          className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-3 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
        />
      </div>

      {/* Fotos da Alimentação (Upload nativo via câmera / galeria - matching video at 01:11) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#c8a88a]" />
          <div>
            <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
              Fotos da Alimentação (Opcional)
            </h3>
            <p className="text-xs text-[#a69a8f]">
              Capture ou carregue fotos que possam ajudar na avaliação da consistência e aceitação
            </p>
          </div>
        </div>

        {/* Meal Selector for Photo */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-[#a69a8f]">Refeição:</span>
          {(['café', 'lanche1', 'almoço', 'lanche2', 'jantar', 'ceia', 'suco'] as MealType[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCurrentMealType(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                currentMealType === m
                  ? 'bg-[#c8a88a] text-[#181513] font-bold'
                  : 'bg-[#27211d] text-[#a69a8f] hover:bg-[#342b26]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Hidden inputs for native camera / gallery */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Action Buttons matching video */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="p-4 rounded-xl bg-[#27211d] hover:bg-[#342b26] border border-[#3a312c] flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-6 h-6 text-[#c8a88a]" />
            <span className="text-sm font-semibold text-[#f4efe8]">Tirar foto</span>
            <span className="text-[11px] text-[#a69a8f]">Usar câmera do celular</span>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="p-4 rounded-xl bg-[#27211d] hover:bg-[#342b26] border border-[#3a312c] flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <ImageIcon className="w-6 h-6 text-[#c8a88a]" />
            <span className="text-sm font-semibold text-[#f4efe8]">Carregar da galeria</span>
            <span className="text-[11px] text-[#a69a8f]">Escolher imagem do dispositivo</span>
          </button>
        </div>
      </div>

      {/* Fotos Salvas de Registros Anteriores (EXATAMENTE COMO AOS 01:12 DO VÍDEO!) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
            Fotos Salvas de Registros
          </h3>
          <span className="text-xs text-[#a69a8f]">
            {patientPhotos.length} foto(s) catalogada(s)
          </span>
        </div>

        {patientPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {patientPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden bg-[#1a1614] border border-[#3a312c] flex flex-col shadow-sm"
              >
                {/* Photo Image */}
                <div className="aspect-video w-full overflow-hidden bg-[#27211d]">
                  <img
                    src={photo.photoUrl}
                    alt={photo.mealType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Footer with Meal tag & Action buttons (matching video at 01:12) */}
                <div className="p-2 flex items-center justify-between bg-[#221d1a] border-t border-[#342b26]">
                  <div>
                    <span className="text-xs font-semibold capitalize text-[#f4efe8] block">
                      {photo.mealType}
                    </span>
                    <span className="text-[10px] text-[#85796f]">
                      {photo.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Editar anotações da foto"
                      onClick={() => {
                        const note = prompt('Editar anotação da refeição:', photo.notes || '');
                        if (note !== null) photo.notes = note;
                      }}
                      className="p-1 rounded text-[#a69a8f] hover:text-[#c8a88a]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Excluir foto"
                      onClick={() => onDeletePhoto(photo.id)}
                      className="p-1 rounded text-[#a69a8f] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[#85796f] border border-dashed border-[#3a312c] rounded-xl text-xs">
            Nenhuma foto anexada para este paciente ainda.
          </div>
        )}
      </div>

      {/* Action Footer (Matching video: Voltar & Salvar Registro) */}
      <div className="flex items-center justify-between pt-4 border-t border-[#342b26]">
        <button
          type="button"
          onClick={() => setActivePatient(null)}
          className="px-5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] text-sm font-medium border border-[#3a312c]"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-8 py-3 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-bold text-sm transition-all shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Registro
        </button>
      </div>
    </div>
  );
};
