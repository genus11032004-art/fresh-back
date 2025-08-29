import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`FreshMarket backend running at http://localhost:${PORT}`));
