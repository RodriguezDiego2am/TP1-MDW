import { Request, Response } from "express";
import Product from "../models/productModel";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData: CreateProductDto = req.body;
    const newProduct = await Product.create(productData);
    res.status(201).json({
      message: "Producto creado exitosamente",
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al crear el producto",
      details: error
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, isActive = true } = req.query;
    
    const filter: any = { isActive: isActive === 'true' };
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const products = await Product.find(filter)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalProducts: total
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener los productos",
      details: error
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener el producto",
      details: error
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateProductDto = req.body;

    const product = await Product.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({
      message: "Producto actualizado exitosamente",
      product
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al actualizar el producto",
      details: error
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete - solo marca como inactivo
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({
      message: "Producto eliminado exitosamente",
      product
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al eliminar el producto",
      details: error
    });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ 
      category: { $regex: category, $options: 'i' },
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      category,
      products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener productos por categoría",
      details: error
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Parámetro de búsqueda requerido" });
    }

    const searchRegex = { $regex: q, $options: 'i' };
    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      searchTerm: q,
      products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al buscar productos",
      details: error
    });
  }
};