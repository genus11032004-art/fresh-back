import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readJSON, writeJSON } from "../lib/storage.js";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const usersFile = path.join(dataDir, "users.json");

const router = express.Router();

router.post("/login", (req, res) => {
  const { phone, name } = req.body || {};
  if (!phone || String(phone).trim().length < 5) {
    return res.status(400).json({ error: "Введите корректный номер телефона" });
  }
  const normalizedPhone = String(phone).replace(/\s+/g, "");

  let users = readJSON(usersFile, []);
  let user = users.find(u => u.phone === normalizedPhone);
  if (!user) {
    const id = nanoid();
    user = { id, phone: normalizedPhone, name: (name||"Покупатель").trim(), addresses: [], createdAt: new Date().toISOString() };
    users.push(user);
    writeJSON(usersFile, users);
  } else if (name && name.trim()) {
    user.name = name.trim();
    writeJSON(usersFile, users);
  }
  res.json({ token: user.id, user });
});

export default router;
