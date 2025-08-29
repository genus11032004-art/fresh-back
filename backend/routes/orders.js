import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readJSON, writeJSON } from "../lib/storage.js";
import { applyPromo } from "../utils/promo.js";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const usersFile = path.join(dataDir, "users.json");
const productsFile = path.join(dataDir, "products.json");
const ordersFile = path.join(dataDir, "orders.json");

const router = express.Router();

function authMiddleware(req, res, next) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const users = readJSON(usersFile, []);
  const user = users.find(u => u.id === token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  req.users = users;
  next();
}

router.get("/", authMiddleware, (req, res) => {
  const orders = readJSON(ordersFile, []);
  const userOrders = orders.filter(o => o.userId === req.user.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});

router.post("/", authMiddleware, (req, res) => {
  const { items, contact, address, paymentMethod, promoCode } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Пустая корзина" });
  if (!contact || !contact.name || !contact.phone) return res.status(400).json({ error: "Заполните контактные данные" });
  if (!address || !address.street || !address.house) return res.status(400).json({ error: "Заполните адрес доставки" });
  if (!paymentMethod) return res.status(400).json({ error: "Выберите способ оплаты" });

  const products = readJSON(productsFile, []);
  let subtotal = 0;
  const detailedItems = items.map(it => {
    const p = products.find(pp => pp.id === it.productId);
    if (!p) throw new Error("Unknown product " + it.productId);
    const qty = Math.max(1, Math.min(99, Number(it.qty) || 1));
    const lineTotal = Math.round(p.price * qty * 100) / 100;
    subtotal += lineTotal;
    return { productId: p.id, name: p.name, price: p.price, qty, lineTotal };
  });

  const promo = applyPromo(promoCode, subtotal);
  const deliveryFee = subtotal >= 3000 ? 0 : 199;
  const total = Math.round((promo.final + deliveryFee) * 100) / 100;

  const orderId = "FM-" + new Date().toISOString().slice(0,10).replace(/-/g, "") + "-" + nanoid(6).toUpperCase();
  const order = {
    id: orderId,
    userId: req.user.id,
    items: detailedItems,
    contact, address, paymentMethod,
    promo: promo.code,
    discount: promo.discount,
    deliveryFee,
    subtotal: Math.round(subtotal * 100) / 100,
    total,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  const orders = readJSON(ordersFile, []);
  orders.push(order);
  writeJSON(ordersFile, orders);

  const users = req.users;
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx !== -1) {
    users[idx].lastOrderId = order.id;
    writeJSON(usersFile, users);
  }

  res.json({ ok: true, order });
});

export default router;
