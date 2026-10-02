-- ==============================================================================
-- SCHEMA RELACIONAL MARIADB / MYSQL: GAMAECOSYSTEM (Health Deglut 7.72 / Production)
-- Banco de Dados Isolado e Exclusivo: `gamaecosystem_db`
-- Motor de Armazenamento: InnoDB (Transações ACID, chaves estrangeiras, utf8mb4)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `gamaecosystem_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `gamaecosystem_db`;

-- 1. Tabela de Configuração Operacional da Clínica (Singleton por clínica)
CREATE TABLE IF NOT EXISTS `clinic_config` (
  `id` VARCHAR(64) NOT NULL,
  `clinic_name` VARCHAR(255) DEFAULT '',
  `legal_name` VARCHAR(255) DEFAULT NULL,
  `cnpj` VARCHAR(32) DEFAULT NULL,
  `technical_manager_name` VARCHAR(255) DEFAULT '',
  `technical_manager_crfa` VARCHAR(64) DEFAULT '',
  `address` TEXT DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `instagram` VARCHAR(128) DEFAULT NULL,
  `logo_url` MEDIUMTEXT DEFAULT NULL,
  `favicon_url` MEDIUMTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Usuários e Autenticação (Acessos ao Portal)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'fonoaudiologo', 'cuidador', 'familiar', 'terapeuta') NOT NULL DEFAULT 'fonoaudiologo',
  `crfa_number` VARCHAR(64) DEFAULT NULL,
  `approved` TINYINT(1) NOT NULL DEFAULT 0,
  `allowed_tabs` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_approved` (`approved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Cuidadores Cadastrados
CREATE TABLE IF NOT EXISTS `caregivers` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(32) DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `role` VARCHAR(128) DEFAULT 'Cuidador',
  `relationship` VARCHAR(128) DEFAULT 'Familiar',
  `digital_signature` MEDIUMTEXT DEFAULT NULL,
  `signature_date` VARCHAR(64) DEFAULT NULL,
  `assigned_patients` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Terapeutas / Profissionais de Saúde
CREATE TABLE IF NOT EXISTS `therapists` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `specialty` VARCHAR(128) NOT NULL,
  `crfa_or_registry` VARCHAR(64) NOT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `digital_signature` MEDIUMTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabela Central de Pacientes
CREATE TABLE IF NOT EXISTS `patients` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `birth_date` VARCHAR(32) DEFAULT NULL,
  `gender` ENUM('Feminino', 'Masculino', 'Outro') DEFAULT 'Feminino',
  `cpf` VARCHAR(32) DEFAULT NULL,
  `main_diagnosis` TEXT DEFAULT NULL,
  `diagnosis` TEXT DEFAULT NULL,
  `medical_history` TEXT DEFAULT NULL,
  `current_medications` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `cep` VARCHAR(32) DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `secondary_phone` VARCHAR(64) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `guardian_name` VARCHAR(255) DEFAULT NULL,
  `guardian_phone` VARCHAR(64) DEFAULT NULL,
  `guardian_email` VARCHAR(191) DEFAULT NULL,
  `receipt_name` VARCHAR(255) DEFAULT NULL,
  `fonoaudiologist_id` VARCHAR(64) DEFAULT NULL,
  `fonoaudiologist_name` VARCHAR(255) DEFAULT NULL,
  `caregiver_id` VARCHAR(64) DEFAULT NULL,
  `caregiver_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('ativo', 'inativo', 'alta') NOT NULL DEFAULT 'ativo',
  `lgpd_consent_accepted` TINYINT(1) DEFAULT 1,
  `lgpd_consent_date` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_patients_status` (`status`),
  INDEX `idx_patients_name` (`name`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabela de Prontuários Médicos Eletrônicos (PEP)
CREATE TABLE IF NOT EXISTS `patient_medical_records` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `record_number` VARCHAR(64) DEFAULT NULL,
  `last_update` VARCHAR(64) DEFAULT NULL,
  `diet_recommendations` TEXT DEFAULT NULL,
  `postural_guidelines` TEXT DEFAULT NULL,
  `allowed_consistencies` TEXT DEFAULT NULL,
  `prohibited_foods` TEXT DEFAULT NULL,
  `exercises_prescribed` TEXT DEFAULT NULL,
  `clinical_notes` MEDIUMTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_patient_record` (`patient_id`),
  CONSTRAINT `fk_record_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabela de Avaliações RaDI (Rastreio e Classificação de Disfagia)
CREATE TABLE IF NOT EXISTS `radi_assessments` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `date` VARCHAR(32) NOT NULL,
  `overall_score` INT NOT NULL DEFAULT 0,
  `clinical_risk` ENUM('Baixo', 'Moderado', 'Grave') NOT NULL DEFAULT 'Baixo',
  `recommended_consistencies` TEXT DEFAULT NULL,
  `swallow_competence` VARCHAR(128) DEFAULT NULL,
  `signs_of_aspiration` TEXT DEFAULT NULL,
  `postural_maneuvers` TEXT DEFAULT NULL,
  `evaluator_name` VARCHAR(255) DEFAULT NULL,
  `evaluator_crfa` VARCHAR(64) DEFAULT NULL,
  `notes` MEDIUMTEXT DEFAULT NULL,
  `raw_answers` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_radi_patient` (`patient_id`),
  CONSTRAINT `fk_radi_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabela de Registros Diários de Alimentação / Deglutição
CREATE TABLE IF NOT EXISTS `daily_feeding_logs` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `date` VARCHAR(32) NOT NULL,
  `meal_type` VARCHAR(64) NOT NULL,
  `meal_name` VARCHAR(128) DEFAULT NULL,
  `consistency` VARCHAR(64) NOT NULL,
  `cough_choke` TINYINT(1) DEFAULT 0,
  `wet_voice` TINYINT(1) DEFAULT 0,
  `multiple_swallows` TINYINT(1) DEFAULT 0,
  `oral_residue` TINYINT(1) DEFAULT 0,
  `nasal_reflux` TINYINT(1) DEFAULT 0,
  `swallowing_difficulty` ENUM('Nenhuma', 'Leve', 'Moderada', 'Intensa') DEFAULT 'Nenhuma',
  `amount_consumed` VARCHAR(64) DEFAULT NULL,
  `meal_duration` INT DEFAULT NULL,
  `alertness_level` VARCHAR(64) DEFAULT NULL,
  `posture_adequate` TINYINT(1) DEFAULT 1,
  `observations` TEXT DEFAULT NULL,
  `photos_json` LONGTEXT DEFAULT NULL,
  `logged_by` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_feeding_patient_date` (`patient_id`, `date`),
  CONSTRAINT `fk_feeding_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabela de Evoluções Oficiais da Fonoaudiologia
CREATE TABLE IF NOT EXISTS `official_evolutions` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `session_date` VARCHAR(32) NOT NULL,
  `session_time` VARCHAR(32) DEFAULT NULL,
  `duration_minutes` INT DEFAULT 45,
  `therapist_id` VARCHAR(64) DEFAULT NULL,
  `therapist_name` VARCHAR(255) DEFAULT NULL,
  `therapist_crfa` VARCHAR(64) DEFAULT NULL,
  `subjective` MEDIUMTEXT DEFAULT NULL,
  `objective` MEDIUMTEXT DEFAULT NULL,
  `assessment` MEDIUMTEXT DEFAULT NULL,
  `plan` MEDIUMTEXT DEFAULT NULL,
  `therapist_signature` MEDIUMTEXT DEFAULT NULL,
  `responsible_signature` MEDIUMTEXT DEFAULT NULL,
  `status` ENUM('rascunho', 'aguardando_familiar', 'finalizado_assinado') DEFAULT 'finalizado_assinado',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_evolutions_patient` (`patient_id`),
  CONSTRAINT `fk_evolution_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
