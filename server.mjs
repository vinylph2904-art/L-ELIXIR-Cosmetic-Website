import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const dataDir = path.join(__dirname, 'src', 'app', 'data');
const usersFile = path.join(dataDir, 'users.json');
const addressesFile = path.join(dataDir, 'addresses.json');
const seedUsers = [
  {
    userId: 'U1718000000000',
    email: 'nguyenvana@gmail.com',
    password: '123456',
    fullName: 'Nguyễn Văn A',
    phoneNumber: '0901234567',
    role: 'customer',
    dateOfBirth: '15/05/1990',
    gender: 'Nam',
    avatarUrl: '',
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];
const seedAddresses = [
  {
    addressId: 'A1718000000000',
    userId: 'U1718000000000',
    fullAddress: '123 Đường Luxury, Quận 1, TP. HCM',
    isDefault: true
  }
];

app.use(cors());
app.use(express.json());

async function ensureFile(filePath, seedValue) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, `${JSON.stringify(seedValue, null, 2)}\n`, 'utf8');
  }
}

async function readJson(filePath, seedValue) {
  await ensureFile(filePath, seedValue);
  const raw = await fs.readFile(filePath, 'utf8');
  return raw.trim() ? JSON.parse(raw) : [];
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

app.get('/api/users', async (_req, res) => {
  try {
    const users = await readJson(usersFile, seedUsers);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Cannot read users data.', error: String(error) });
  }
});

app.put('/api/users', async (req, res) => {
  try {
    const users = Array.isArray(req.body) ? req.body : [];
    await writeJson(usersFile, users);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cannot save users data.', error: String(error) });
  }
});

app.get('/api/addresses', async (_req, res) => {
  try {
    const addresses = await readJson(addressesFile, seedAddresses);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Cannot read addresses data.', error: String(error) });
  }
});

app.put('/api/addresses', async (req, res) => {
  try {
    const addresses = Array.isArray(req.body) ? req.body : [];
    await writeJson(addressesFile, addresses);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cannot save addresses data.', error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`JSON data server running at http://localhost:${port}`);
});