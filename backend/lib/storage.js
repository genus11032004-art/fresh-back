import fs from "fs";

export function readJSON(file, fallback = []) {
  if (!fs.existsSync(file)) return fallback;
  try {
    const txt = fs.readFileSync(file, "utf-8");
    return txt ? JSON.parse(txt) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
