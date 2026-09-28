// Security and LGPD Cryptographic Utilities using native Web Crypto API

export async function generateSHA256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate digital verification stamp for clinical reports
export async function generateClinicalSeal(patientId: string, timestamp: string, evaluatorId: string): Promise<string> {
  const rawData = `GAMA-HEALTH-DEGLUT::PATIENT-${patientId}::EVAL-${evaluatorId}::TS-${timestamp}`;
  const fullHash = await generateSHA256(rawData);
  return `HD-${fullHash.substring(0, 16).toUpperCase()}`;
}

// Format input values as user types
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Mask sensitive data for LGPD visual protection
export function maskCPF(cpf: string): string {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `${clean.substring(0, 3)}.***.***-${clean.substring(9, 11)}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return phone;
  return `(${clean.substring(0, 2)}) *****-${clean.substring(clean.length - 4)}`;
}

// AES-GCM Simple text encryption / decryption using client passkey for demonstration
export async function encryptSensitiveText(text: string, secretKey = 'GamaDeglutLGPD2026SecretKey!'): Promise<string> {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretKey.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      enc.encode(text)
    );

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    return `${ivBase64}:${cipherBase64}`;
  } catch (e) {
    console.error('Encryption error:', e);
    return text;
  }
}

export async function decryptSensitiveText(cipherPayload: string, secretKey = 'GamaDeglutLGPD2026SecretKey!'): Promise<string> {
  try {
    if (!cipherPayload.includes(':')) return cipherPayload;
    const [ivBase64, cipherBase64] = cipherPayload.split(':');
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const cipherData = Uint8Array.from(atob(cipherBase64), c => c.charCodeAt(0));

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretKey.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      cipherData
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('Decryption error:', e);
    return cipherPayload;
  }
}
