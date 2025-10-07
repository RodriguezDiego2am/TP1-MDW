import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import loginRoutes from "./routes/loginRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI!;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-frontend-domain.com'] // Cambia por tu dominio de frontend
    : ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "¡API funcionando correctamente!",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout"
      },
      products: {
        list: "GET /api/products",
        search: "GET /api/products/search?q=término",
        category: "GET /api/products/category/:category",
        create: "POST /api/products (auth required)",
        update: "PUT /api/products/:id (auth required)",
        delete: "DELETE /api/products/:id (auth required)"
      },
      cart: {
        get: "GET /api/cart (auth required)",
        add: "POST /api/cart/add (auth required)",
        update: "PUT /api/cart/update (auth required)",
        remove: "DELETE /api/cart/remove (auth required)",
        clear: "DELETE /api/cart/clear (auth required)"
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const connectToDb = async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferCommands: false
    });
    console.log("MongoDB Atlas conectado exitosamente");
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error}`);
    process.exit(1); // Salir si no puede conectar
  }
};
connectToDb();
