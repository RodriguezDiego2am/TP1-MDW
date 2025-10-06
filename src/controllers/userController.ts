import { Request, Response } from "express";
import User from "../models/userModel";
import { CreateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user : CreateUserDto = req.body;
    
    // Verificar si el usuario ya existe antes de hashearlo
    const existingUser = await User.findOne({ email: user.email }).maxTimeMS(20000);
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashPassword = await bcrypt.hash(user.password, 10);
    const newUser = await User.create({ ...user, password: hashPassword });
    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error: any) {
    console.error("Error en registerUser:", error);
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        error: "Error de conexión con la base de datos. Intenta nuevamente." 
      });
    }
    res.status(500).json({ 
      error: "Error al crear el usuario",
      details: error.message 
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, req.body);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const jwtAccessSecret = process.env.JWT_SECRET;
  const jwtAccessExpiresIn = process.env.JWT_EXPIRES_IN!;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN!;
  const findUser = await User.findOne({ email });

  if (!findUser) return res.status(404).json({ message: "Usuario no encontrado" });

  const isMatch = await bcrypt.compare(password, findUser.password);
  if (!isMatch) return res.status(401).json({ message: "Credenciales inválidas" });

  if (!jwtAccessSecret || !jwtRefreshSecret) {
    return res.status(500).json({ message: "JWT no definido" });
  }
  const accessToken = jwt.sign(
    { userId: findUser._id.toString(), email: findUser.email },
    jwtAccessSecret,
    { expiresIn: jwtAccessExpiresIn }
  );

    const refreshToken = jwt.sign(
    { userId: findUser._id.toString() },
    jwtRefreshSecret,
    { expiresIn: jwtRefreshExpiresIn }
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 1000 // 1 minute
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.json({ message: "Login exitoso" })
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: "Logout exitoso" });
};