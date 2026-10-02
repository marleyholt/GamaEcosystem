/**
 * Servidor de Produção Integrado Express + MariaDB / MySQL
 * Responsável por servir a aplicação GamaEcosystem e todos os endpoints de dados
 */

const express = require('express');
let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.warn('Pacote mysql2 nao encontrado localmente. Instale com npm i mysql2');
}
let cors;
try {
  cors = require('cors');
} catch (e) {
  cors = () => (req, res, next) => next();
}
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Pool de conexão com o banco de dados MariaDB / MySQL
let pool = null;
if (mysql) {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'gama_user',
      password: process.env.DB_PASSWORD || 'GamaEco#2026!Secure',
      database: process.env.DB_NAME || 'gamaecosystem_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } catch (err) {
    console.error('Erro ao instanciar pool mysql2:', err.message);
  }
}

// Teste de conexão
app.get('/api/health', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ status: 'warning', database: 'mysql2_not_installed' });
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ status: 'ok', database: 'connected', time: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// Sincronização inicial de tudo
app.get('/api/sync/all', async (req, res) => {
  try {
    if (!pool) return res.json({ clinicConfig: null, users: [], therapists: [], caregivers: [], patients: [], medicalRecords: [], radi: [], dailyLogs: [], evolutions: [] });
    const [patients] = await pool.query('SELECT * FROM patients ORDER BY updated_at DESC');
    const [users] = await pool.query('SELECT id, email, name, role, crfa_number, approved, allowed_tabs, created_at FROM users');
    const [therapists] = await pool.query('SELECT * FROM therapists ORDER BY updated_at DESC');
    const [caregivers] = await pool.query('SELECT * FROM caregivers ORDER BY updated_at DESC');
    const [clinicConfigRows] = await pool.query('SELECT * FROM clinic_config LIMIT 1');
    const [medicalRecords] = await pool.query('SELECT * FROM patient_medical_records');
    const [radi] = await pool.query('SELECT * FROM radi_assessments');
    const [dailyLogs] = await pool.query('SELECT * FROM daily_feeding_logs');
    const [evolutions] = await pool.query('SELECT * FROM official_evolutions');

    res.json({
      patients,
      users,
      therapists,
      caregivers,
      clinicConfig: clinicConfigRows[0] ? {
        id: clinicConfigRows[0].id,
        clinicName: clinicConfigRows[0].clinic_name,
        technicalResponsible: clinicConfigRows[0].technical_manager_name || 'Adriane Paes da Gama',
        crfa: clinicConfigRows[0].technical_manager_crfa,
        addressLine: clinicConfigRows[0].address,
        phoneWhatsapp: clinicConfigRows[0].phone,
        email: clinicConfigRows[0].email,
        instagram: clinicConfigRows[0].instagram,
        logoUrl: clinicConfigRows[0].logo_url,
        // Também preserva formato original
        clinic_name: clinicConfigRows[0].clinic_name,
        technical_manager_name: clinicConfigRows[0].technical_manager_name,
        technical_manager_crfa: clinicConfigRows[0].technical_manager_crfa,
        address: clinicConfigRows[0].address,
        phone: clinicConfigRows[0].phone
      } : null,
      medicalRecords,
      radi,
      dailyLogs,
      evolutions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Configuração da Clínica
app.post('/api/clinic-config', async (req, res) => {
  try {
    const cfg = req.body;
    const id = cfg.id || 'global_config';
    // Salva ou atualiza a configuracao no banco
    const clinicName = cfg.clinicName || cfg.clinic_name || 'GAMA FONOAUDIOLOGIA';
    const techName = cfg.technicalResponsible || cfg.technical_manager_name || 'Adriane Gama';
    const crfa = cfg.crfa || cfg.technical_manager_crfa || 'CREFONO 9531-RJ';
    const address = cfg.addressLine || cfg.address || '';
    const phone = cfg.phoneWhatsapp || cfg.phone || '';
    const email = cfg.email || 'adrianepaesdagama@gmail.com';
    const instagram = cfg.instagram || '';
    const logoUrl = cfg.logoUrl || cfg.logo_url || '';

    const query = `
      INSERT INTO clinic_config (id, clinic_name, technical_manager_name, technical_manager_crfa, address, phone, email, instagram, logo_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        clinic_name = VALUES(clinic_name),
        technical_manager_name = VALUES(technical_manager_name),
        technical_manager_crfa = VALUES(technical_manager_crfa),
        address = VALUES(address),
        phone = VALUES(phone),
        email = VALUES(email),
        instagram = VALUES(instagram),
        logo_url = VALUES(logo_url),
        updated_at = NOW()
    `;
    await pool.query(query, [
      id,
      clinicName,
      techName,
      crfa,
      address,
      phone,
      email,
      instagram,
      logoUrl
    ]);
    res.json({ success: true, message: 'Configuração atualizada com sucesso no MariaDB.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Terapeutas
app.post('/api/therapists', async (req, res) => {
  try {
    const t = req.body;
    const query = `
      INSERT INTO therapists (id, name, specialty, crfa_or_registry, email, phone, digital_signature, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        specialty = VALUES(specialty),
        crfa_or_registry = VALUES(crfa_or_registry),
        email = VALUES(email),
        phone = VALUES(phone),
        digital_signature = VALUES(digital_signature),
        updated_at = NOW()
    `;
    await pool.query(query, [
      t.id,
      t.name,
      t.specialty || 'Fonoaudiologia',
      t.crfa || t.crfa_or_registry || '',
      t.email || '',
      t.phone || '',
      t.signatureUrl || null
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/therapists/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM therapists WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cuidadores
app.post('/api/caregivers', async (req, res) => {
  try {
    const c = req.body;
    const query = `
      INSERT INTO caregivers (id, name, cpf, phone, email, role, relationship, assigned_patients, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        cpf = VALUES(cpf),
        phone = VALUES(phone),
        email = VALUES(email),
        role = VALUES(role),
        relationship = VALUES(relationship),
        assigned_patients = VALUES(assigned_patients),
        updated_at = NOW()
    `;
    await pool.query(query, [
      c.id,
      c.name,
      c.cpf || '',
      c.phone || '',
      c.email || '',
      c.kinshipOrRole || c.role || 'Cuidador',
      c.kinshipOrRole || 'Familiar',
      JSON.stringify(c.assignedPatientIds || [])
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/caregivers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM caregivers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Usuários
app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;
    const query = `
      INSERT INTO users (id, email, name, role, crfa_number, approved, allowed_tabs, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        role = VALUES(role),
        crfa_number = VALUES(crfa_number),
        approved = VALUES(approved),
        allowed_tabs = VALUES(allowed_tabs),
        updated_at = NOW()
    `;
    await pool.query(query, [
      u.id,
      u.email,
      u.name,
      u.role || 'fonoaudiologo',
      u.crfaNumber || null,
      u.approved ? 1 : 0,
      JSON.stringify(u.allowedTabs || [])
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pacientes
app.post('/api/patients', async (req, res) => {
  try {
    const p = req.body;
    const query = `
      INSERT INTO patients (
        id, name, birth_date, gender, cpf, main_diagnosis, diagnosis, medical_history,
        current_medications, address, cep, phone, secondary_phone, email,
        guardian_name, guardian_phone, guardian_email, receipt_name,
        fonoaudiologist_id, fonoaudiologist_name, caregiver_id, caregiver_name,
        status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        birth_date = VALUES(birth_date),
        gender = VALUES(gender),
        cpf = VALUES(cpf),
        main_diagnosis = VALUES(main_diagnosis),
        diagnosis = VALUES(diagnosis),
        medical_history = VALUES(medical_history),
        current_medications = VALUES(current_medications),
        address = VALUES(address),
        cep = VALUES(cep),
        phone = VALUES(phone),
        secondary_phone = VALUES(secondary_phone),
        email = VALUES(email),
        guardian_name = VALUES(guardian_name),
        guardian_phone = VALUES(guardian_phone),
        guardian_email = VALUES(guardian_email),
        receipt_name = VALUES(receipt_name),
        fonoaudiologist_id = VALUES(fonoaudiologist_id),
        fonoaudiologist_name = VALUES(fonoaudiologist_name),
        caregiver_id = VALUES(caregiver_id),
        caregiver_name = VALUES(caregiver_name),
        status = VALUES(status),
        updated_at = NOW()
    `;
    await pool.query(query, [
      p.id,
      p.name,
      p.birthDate || '',
      p.gender || 'Feminino',
      p.cpf || '',
      p.mainDiagnosis || '',
      p.diagnosis || p.mainDiagnosis || '',
      p.medicalHistory || '',
      p.currentMedications || '',
      p.address || '',
      p.cep || '',
      p.phone || '',
      p.secondaryPhone || '',
      p.email || '',
      p.guardianName || '',
      p.guardianPhone || '',
      p.guardianEmail || '',
      p.receiptName || '',
      p.fonoaudiologistId || '',
      p.fonoaudiologistName || '',
      p.caregiverId || '',
      p.caregiverName || '',
      p.status || 'ativo'
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Arquivos estáticos do Vite em Produção
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor MariaDB / Express ativo na porta ${PORT}`);
});
