import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts
} from "../controllers/productController";
import validationMiddleware from "../middlewares/middleware";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Rutas públicas (accesibles sin autenticación)
router.get("/", getProducts);                          // GET /api/products - Listar productos con paginación
router.get("/search", searchProducts);                 // GET /api/products/search?q=término
router.get("/category/:category", getProductsByCategory); // GET /api/products/category/electronics
router.get("/:id", getProduct);                        // GET /api/products/:id - Obtener producto específico

// Rutas protegidas (requieren autenticación para crear/modificar productos)
router.post("/", authMiddleware, validationMiddleware(CreateProductDto), createProduct);        // POST /api/products - Crear producto
router.put("/:id", authMiddleware, validationMiddleware(UpdateProductDto), updateProduct);      // PUT /api/products/:id - Actualizar producto
router.delete("/:id", authMiddleware, deleteProduct);                                          // DELETE /api/products/:id - Eliminar producto

export default router;