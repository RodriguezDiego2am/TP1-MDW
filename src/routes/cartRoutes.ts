import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from "../controllers/cartController";
import validationMiddleware from "../middlewares/middleware";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";
import { RemoveFromCartDto } from "../dto/remove-from-cart.dto";

const router = express.Router();

// Todas las rutas del carrito requieren autenticación
// El middleware de autenticación se aplicará en index.ts

router.get("/", getCart);                                                    // GET /api/cart - Obtener carrito del usuario
router.get("/summary", getCartSummary);                                      // GET /api/cart/summary - Resumen del carrito
router.post("/add", validationMiddleware(AddToCartDto), addToCart);          // POST /api/cart/add - Agregar producto al carrito
router.put("/update", validationMiddleware(UpdateCartItemDto), updateCartItem); // PUT /api/cart/update - Actualizar cantidad
router.delete("/remove", validationMiddleware(RemoveFromCartDto), removeFromCart); // DELETE /api/cart/remove - Eliminar producto
router.delete("/clear", clearCart);                                          // DELETE /api/cart/clear - Vaciar carrito

export default router;