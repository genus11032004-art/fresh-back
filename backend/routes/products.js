import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readJSON } from "../lib/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const productsFile = path.join(dataDir, "products.json");

const router = express.Router();

function filterProducts(list, q, categoryPath, brand, minPrice, maxPrice, availability, unit) {
  let result = list.slice();

  if (q) {
    const needle = q.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(needle) ||
      p.brand.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle) ||
      p.category.join(" / ").toLowerCase().includes(needle)
    );
  }

  if (categoryPath) {
    const pathParts = categoryPath.toLowerCase().split("/").filter(Boolean);
    result = result.filter(p => {
      const cat = p.category.map(s => s.toLowerCase());
      return pathParts.every((part, idx) => cat[idx] === part);
    });
  }

  if (brand) {
    const brands = brand.split(",").map(b => b.trim().toLowerCase()).filter(Boolean);
    if (brands.length) result = result.filter(p => brands.includes(p.brand.toLowerCase()));
  }

  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

  if (availability) {
    if (availability === "instock") result = result.filter(p => p.stock > 0);
    if (availability === "outofstock") result = result.filter(p => p.stock === 0);
  }

  if (unit) {
    const units = unit.split(",").map(u => u.trim().toLowerCase());
    result = result.filter(p => units.includes(p.unit.toLowerCase()));
  }
  return result;
}

function sortProducts(list, sort) {
  switch (sort) {
    case "price_asc": return list.sort((a,b) => a.price - b.price);
    case "price_desc": return list.sort((a,b) => b.price - a.price);
    case "popular": return list.sort((a,b) => b.popularity - a.popularity);
    case "new": return list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    default: return list;
  }
}

router.get("/", (req, res) => {
  const all = readJSON(productsFile, []);
  const { q, category, brand, minPrice, maxPrice, availability, unit, sort = "popular", limit = "100", offset = "0" } = req.query;

  let list = filterProducts(all, q, category, brand, minPrice, maxPrice, availability, unit);
  list = sortProducts(list, sort);
  const start = Number(offset) || 0;
  const end = start + (Number(limit) || 100);
  res.json({ total: list.length, items: list.slice(start, end) });
});

router.get("/suggest", (req, res) => {
  const all = readJSON(productsFile, []);
  const { q } = req.query;
  if (!q || String(q).trim().length < 1) return res.json([]);
  const needle = q.toLowerCase();
  const list = all.filter(p =>
    p.name.toLowerCase().includes(needle) ||
    p.brand.toLowerCase().includes(needle) ||
    p.category.join(" / ").toLowerCase().includes(needle)
  ).slice(0, 8).map(p => ({ id: p.id, name: p.name, brand: p.brand, price: p.price }));
  res.json(list);
});

router.get("/brands", (req, res) => {
  const all = readJSON(productsFile, []);
  const brands = Array.from(new Set(all.map(p => p.brand))).sort();
  res.json(brands);
});

router.get("/categories", (req, res) => {
  const all = readJSON(productsFile, []);
  const root = {};
  for (const p of all) {
    let node = root;
    p.category.forEach(part => {
      if (!node[part]) node[part] = {};
      node = node[part];
    });
  }
  res.json(root);
});

router.get("/:id", (req, res) => {
  const all = readJSON(productsFile, []);
  const found = all.find(p => p.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Not found" });
  res.json(found);
});

export default router;
