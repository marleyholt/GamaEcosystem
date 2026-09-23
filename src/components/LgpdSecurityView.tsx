import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Server, 
  Key, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  AlertCircle 
} from 'lucide-react';

export const LgpdSecurityView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  // Ready-to-use production MySQL/MariaDB DDL for the planned Ubuntu server migration
  const mariaDbSchemaSql = `-- ====================================================================
-- GAMA ECOSYSTEM - HEALTH DEGLUT
-- Schema de Migração de Dados Sensíveis para MariaDB / MySQL 8 (Ubuntu Server)
-- Conformidade: LGPD (Lei 13.709/2018) com Motor InnoDB e Transações ACID
-- ====================================================================

CREATE DATABASE IF NOT EXISTS \`health_deglut_prod\` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE \`health_deglut_prod\`;

-- 1. Usuários e Controle de Acesso (RBAC)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(128) NOT NULL,
  \`email\` VARCHAR(256) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`role\` ENUM('fonoaudiologo', 'cuidador', 'admin') NOT NULL DEFAULT 'cuidador',
  \`approved\` TINYINT(1) NOT NULL DEFAULT 0,
  \`crfa_number\` VARCHAR(50) NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_users_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Pacientes Clínicos (Dados Pessoais e Sensíveis com Proteção LGPD)
CREATE TABLE IF NOT EXISTS \`patients\` (
  \`id\` VARCHAR(128) NOT NULL,
  \`name\` VARCHAR(200) NOT NULL,
  \`cpf_encrypted\` VARCHAR(256) NULL,
  \`birth_date\` DATE NULL,
  \`phone\` VARCHAR(50) NULL,
  \`email\` VARCHAR(256) NULL,
  \`address\` VARCHAR(300) NULL,
  \`diagnosis\` TEXT NOT NULL,
  \`medical_history\` TEXT NULL,
  \`current_medications\` TEXT NULL,
  \`guardian_name\` VARCHAR(200) NULL,
  \`guardian_phone\` VARCHAR(50) NULL,
  \`guardian_email\` VARCHAR(256) NULL,
  \`fonoaudiologist_id\` VARCHAR(128) NULL,
  \`caregiver_id\` VARCHAR(128) NULL,
  \`status\` ENUM('ativo', 'inativo', 'alta') NOT NULL DEFAULT 'ativo',
  \`lgpd_consent_accepted\` TINYINT(1) NOT NULL DEFAULT 1,
  \`lgpd_consent_timestamp\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_patient_status\` (\`status\`),
  INDEX \`idx_patient_fono\` (\`fonoaudiologist_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Triagens de Risco de Disfagia (RaDI)
CREATE TABLE IF NOT EXISTS \`radi_assessments\` (
  \`id\` VARCHAR(128) NOT NULL,
  \`patient_id\` VARCHAR(128) NOT NULL,
  \`evaluator_id\` VARCHAR(128) NOT NULL,
  \`evaluator_name\` VARCHAR(150) NOT NULL,
  \`score\` INT NOT NULL,
  \`risk_level\` ENUM('Baixo Risco', 'Risco Moderado', 'Alto Risco') NOT NULL,
  \`answers_json\` JSON NOT NULL,
  \`clinical_recommendations\` TEXT NOT NULL,
  \`verification_hash\` VARCHAR(64) NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_radi_patient\` (\`patient_id\`),
  CONSTRAINT \`fk_radi_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Registros Diários de Alimentação (Consistência IDDSI & Sintomas)
CREATE TABLE IF NOT EXISTS \`daily_feeding_logs\` (
  \`id\` VARCHAR(128) NOT NULL,
  \`patient_id\` VARCHAR(128) NOT NULL,
  \`caregiver_id\` VARCHAR(128) NOT NULL,
  \`log_date\` DATE NOT NULL,
  \`food_consistency\` VARCHAR(100) NOT NULL,
  \`food_consistency_level\` INT NOT NULL,
  \`liquid_consistency\` VARCHAR(100) NOT NULL,
  \`liquid_consistency_level\` INT NOT NULL,
  \`liquid_brand_dose\` VARCHAR(300) NULL,
  \`symptoms_json\` JSON NULL,
  \`observations_encrypted\` TEXT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_log_patient_date\` (\`patient_id\`, \`log_date\`),
  CONSTRAINT \`fk_log_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Galeria de Fotos de Refeições
CREATE TABLE IF NOT EXISTS \`clinical_photos\` (
  \`id\` VARCHAR(128) NOT NULL,
  \`patient_id\` VARCHAR(128) NOT NULL,
  \`log_id\` VARCHAR(128) NULL,
  \`meal_type\` ENUM('café', 'lanche1', 'almoço', 'lanche2', 'jantar', 'ceia', 'suco') NOT NULL,
  \`photo_storage_path\` VARCHAR(512) NOT NULL,
  \`date\` DATE NOT NULL,
  \`notes\` VARCHAR(500) NULL,
  \`uploaded_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_photo_patient\` (\`patient_id\`),
  CONSTRAINT \`fk_photo_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Trilha de Auditoria e Conformidade LGPD (Audit Logs)
CREATE TABLE IF NOT EXISTS \`audit_trail\` (
  \`id\` BIGINT AUTO_INCREMENT NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`user_id\` VARCHAR(128) NOT NULL,
  \`user_role\` VARCHAR(50) NOT NULL,
  \`patient_id\` VARCHAR(128) NULL,
  \`details\` TEXT NOT NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`timestamp\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_audit_user\` (\`user_id\`),
  INDEX \`idx_audit_patient\` (\`patient_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

  const copySql = () => {
    navigator.clipboard.writeText(mariaDbSchemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSql = () => {
    const blob = new Blob([mariaDbSchemaSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_mariadb_health_deglut.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
          Segurança, LGPD & Preparação MariaDB / Ubuntu
        </h2>
        <p className="text-xs text-[#a69a8f] mt-1">
          Arquitetura de proteção de dados sensíveis de saúde (Lei 13.709/2018) e pipeline de migração
        </p>
      </div>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="w-5 h-5" />
            <h4 className="font-bold text-sm text-[#f4efe8]">Criptografia Ponta a Ponta</h4>
          </div>
          <p className="text-xs text-[#a69a8f] leading-relaxed">
            Algoritmo <strong>AES-GCM (256-bit)</strong> com IV único por registro para prontuários e notas confidenciais. Assinatura de laudos via <strong>SHA-256</strong>.
          </p>
          <div className="pt-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              Ativo no Navegador & Cloud
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] space-y-2">
          <div className="flex items-center gap-2 text-[#c8a88a]">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold text-sm text-[#f4efe8]">Conformidade LGPD</h4>
          </div>
          <p className="text-xs text-[#a69a8f] leading-relaxed">
            Tratamento de dados sensíveis de saúde (Art. 5º e 11) respaldado pelo <strong>TCLE digital</strong> e isolamento estrito de permissões (Fono vs Cuidador).
          </p>
          <div className="pt-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#342b26] text-[#c8a88a] border border-[#4a3e37]">
              Auditoria de Trilha Ativa
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Server className="w-5 h-5" />
            <h4 className="font-bold text-sm text-[#f4efe8]">Servidor Ubuntu & MariaDB</h4>
          </div>
          <p className="text-xs text-[#a69a8f] leading-relaxed">
            Fase 1 com <strong>Firebase Firestore</strong> provisionado. Fase 2 com esquema relacional preparado para <strong>MariaDB InnoDB</strong> com alta disponibilidade.
          </p>
          <div className="pt-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40">
              Pronto para Migração
            </span>
          </div>
        </div>
      </div>

      {/* Migration Script Box */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#342b26] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2d2622] text-[#c8a88a] border border-[#4a3e37]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-[#f4efe8]">
                Script de Migração SQL (MariaDB / MySQL 8 no Ubuntu)
              </h3>
              <p className="text-xs text-[#a69a8f]">
                Tabelas com índices de busca rápida, integridade referencial com chaves estrangeiras e motor InnoDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySql}
              className="px-3.5 py-1.5 rounded-lg bg-[#2d2622] hover:bg-[#3d332d] text-[#c8a88a] text-xs font-semibold border border-[#4a3e37] flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar SQL'}
            </button>

            <button
              onClick={downloadSql}
              className="px-4 py-1.5 rounded-lg bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Baixar schema.sql
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="relative">
          <pre className="p-4 bg-[#181513] border border-[#342b26] rounded-xl text-xs font-mono text-[#d6c7b9] overflow-x-auto max-h-96 scrollbar-thin">
            {mariaDbSchemaSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
