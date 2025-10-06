import { Request, Response } from "express";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";
import { RemoveFromCartDto } from "../dto/remove-from-cart.dto";
import jwt from "jsonwebtoken";

// Helper function to get user ID from token
const getUserIdFromToken = (req: Request): string | null => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    let cart = await Cart.findOne({ user: userId, isActive: true })
      .populate('items.product', 'name price image stock isActive');

    if (!cart) {
      // Crear carrito vacío si no existe
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener el carrito",
      details: error
    });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { productId, quantity }: AddToCartDto = req.body;

    // Verificar que el producto existe y está activo
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado o inactivo" });
    }

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: "Stock insuficiente",
        available: product.stock,
        requested: quantity
      });
    }

    // Buscar o crear carrito
    let cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Actualizar cantidad del producto existente
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          error: "Stock insuficiente para la cantidad total",
          available: product.stock,
          currentInCart: cart.items[existingItemIndex].quantity,
          requested: quantity
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Agregar nuevo producto al carrito
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price
      } as any);
    }

    await cart.save();

    // Repoblar para la respuesta
    await cart.populate('items.product', 'name price image stock isActive');

    res.status(200).json({
      message: "Producto agregado al carrito exitosamente",
      cart
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al agregar producto al carrito",
      details: error
    });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { productId, quantity }: UpdateCartItemDto = req.body;

    // Verificar producto y stock
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado o inactivo" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: "Stock insuficiente",
        available: product.stock,
        requested: quantity
      });
    }

    const cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    // Actualizar cantidad
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Actualizar precio por si cambió

    await cart.save();
    await cart.populate('items.product', 'name price image stock isActive');

    res.status(200).json({
      message: "Cantidad actualizada exitosamente",
      cart
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al actualizar el carrito",
      details: error
    });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { productId }: RemoveFromCartDto = req.body;

    const cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    // Eliminar producto del carrito
    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate('items.product', 'name price image stock isActive');

    res.status(200).json({
      message: "Producto eliminado del carrito exitosamente",
      cart
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al eliminar producto del carrito",
      details: error
    });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.items.splice(0, cart.items.length); // Vaciar el array sin reasignar
    await cart.save();

    res.status(200).json({
      message: "Carrito vaciado exitosamente",
      cart
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al vaciar el carrito",
      details: error
    });
  }
};

export const getCartSummary = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const cart = await Cart.findOne({ user: userId, isActive: true })
      .populate('items.product', 'name price');

    if (!cart) {
      return res.status(200).json({
        totalItems: 0,
        totalAmount: 0,
        itemsCount: 0
      });
    }

    res.status(200).json({
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      itemsCount: cart.items.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener resumen del carrito",
      details: error
    });
  }
};