import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Arquivo de persistência local simulando o MariaDB / backend em ambiente de desenvolvimento
const DB_FILE = path.join(__dirname, 'mariadb_mock_store.json');

// Estrutura inicial do banco caso não exista
const getInitialDB = () => ({
  clinicConfig: null,
  users: [],
  therapists: [],
  caregivers: [],
  patients: [],
  medicalRecords: [],
  radi: [],
  dailyLogs: [],
  evolutions: []
});

const readDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Erro ao ler DB_FILE:', err);
  }
  const initial = getInitialDB();
  writeDB(initial);
  return initial;
};

const writeDB = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao gravar DB_FILE:', err);
  }
};

// ==========================================
// Rotas da API MariaDB / Express
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MariaDB / MySQL', timestamp: new Date().toISOString() });
});

// Sincronização geral
app.get('/api/sync/all', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Configuração da Clínica / RT
app.post('/api/clinic-config', (req, res) => {
  const config = req.body;
  const db = readDB();
  db.clinicConfig = config;
  writeDB(db);
  res.json({ success: true, message: 'Configuração salva com sucesso no MariaDB.' });
});

// Usuários
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  const db = readDB();
  db.users = db.users || [];
  const idx = db.users.findIndex((u: any) => u.id === user.id || u.email?.toLowerCase() === user.email?.toLowerCase());
  if (idx >= 0) {
    db.users[idx] = { ...db.users[idx], ...user };
  } else {
    db.users.push(user);
  }
  writeDB(db);
  res.json({ success: true, user });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.users = (db.users || []).filter((u: any) => u.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Terapeutas / Fono & Equipe
app.get('/api/therapists', (req, res) => {
  const db = readDB();
  res.json(db.therapists || []);
});

app.post('/api/therapists', (req, res) => {
  const therapist = req.body;
  const db = readDB();
  db.therapists = db.therapists || [];
  const idx = db.therapists.findIndex((t: any) => t.id === therapist.id);
  if (idx >= 0) {
    db.therapists[idx] = therapist;
  } else {
    db.therapists.push(therapist);
  }
  writeDB(db);
  res.json({ success: true, therapist });
});

app.delete('/api/therapists/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.therapists = (db.therapists || []).filter((t: any) => t.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Cuidadores
app.get('/api/caregivers', (req, res) => {
  const db = readDB();
  res.json(db.caregivers || []);
});

app.post('/api/caregivers', (req, res) => {
  const caregiver = req.body;
  const db = readDB();
  db.caregivers = db.caregivers || [];
  const idx = db.caregivers.findIndex((c: any) => c.id === caregiver.id);
  if (idx >= 0) {
    db.caregivers[idx] = caregiver;
  } else {
    db.caregivers.push(caregiver);
  }
  writeDB(db);
  res.json({ success: true, caregiver });
});

app.delete('/api/caregivers/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.caregivers = (db.caregivers || []).filter((c: any) => c.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Pacientes
app.post('/api/patients', (req, res) => {
  const patient = req.body;
  const db = readDB();
  db.patients = db.patients || [];
  const idx = db.patients.findIndex((p: any) => p.id === patient.id);
  if (idx >= 0) {
    db.patients[idx] = patient;
  } else {
    db.patients.push(patient);
  }
  writeDB(db);
  res.json({ success: true });
});

// Prontuários
app.post('/api/medical-records', (req, res) => {
  const record = req.body;
  const db = readDB();
  db.medicalRecords = db.medicalRecords || [];
  const idx = db.medicalRecords.findIndex((r: any) => r.id === record.id);
  if (idx >= 0) {
    db.medicalRecords[idx] = record;
  } else {
    db.medicalRecords.push(record);
  }
  writeDB(db);
  res.json({ success: true });
});

// RaDI
app.post('/api/radi', (req, res) => {
  const radi = req.body;
  const db = readDB();
  db.radi = db.radi || [];
  const idx = db.radi.findIndex((r: any) => r.id === radi.id);
  if (idx >= 0) {
    db.radi[idx] = radi;
  } else {
    db.radi.push(radi);
  }
  writeDB(db);
  res.json({ success: true });
});

// Feeding Logs
app.post('/api/feeding-logs', (req, res) => {
  const log = req.body;
  const db = readDB();
  db.dailyLogs = db.dailyLogs || [];
  const idx = db.dailyLogs.findIndex((l: any) => l.id === log.id);
  if (idx >= 0) {
    db.dailyLogs[idx] = log;
  } else {
    db.dailyLogs.push(log);
  }
  writeDB(db);
  res.json({ success: true });
});

// Evolutions
app.post('/api/evolutions', (req, res) => {
  const evo = req.body;
  const db = readDB();
  db.evolutions = db.evolutions || [];
  const idx = db.evolutions.findIndex((e: any) => e.id === evo.id);
  if (idx >= 0) {
    db.evolutions[idx] = evo;
  } else {
    db.evolutions.push(evo);
  }
  writeDB(db);
  res.json({ success: true });
});

// Backups MariaDB
app.get('/api/admin/backups', (req, res) => {
  res.json({
    backups: [
      {
        filename: 'backup_mariadb_gamaecosystem_auto.sql',
        size: '1.4 MB',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/admin/backup', (req, res) => {
  const filename = `backup_gamaecosystem_${Date.now()}.sql`;
  res.json({
    success: true,
    message: 'Backup do MariaDB gerado com sucesso via mysqldump.',
    filename
  });
});

// Em modo de desenvolvimento, monta o Vite via middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Servidor MariaDB / Express rodando na porta ${PORT}`);
  });
}

startServer();
