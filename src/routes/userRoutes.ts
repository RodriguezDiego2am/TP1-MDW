import {
  registerUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  login,
} from "../controllers/userController";
import express from "express";
import validationMiddleware from "../middlewares/middleware";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

const router = express.Router();

router.post("/", validationMiddleware(CreateUserDto), registerUser);
router.get("/", getUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);
router.put("/:id", validationMiddleware(UpdateUserDto), updateUser);
router.post("/login", login);

export default router;
