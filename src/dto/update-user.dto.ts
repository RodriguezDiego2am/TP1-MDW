import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  MinLength,
  MaxLength,
} from "class-validator";
import userModel from "../models/userModel";

@ValidatorConstraint({ async: true })
class isEmailUnique implements ValidatorConstraintInterface {
  async validate(email: string) {
    const user = await userModel.findOne({ email });
    return !user;
  }
  defaultMessage = () => "El correo ya está en uso";
}

export class UpdateUserDto {
  @IsString({ message: "El nombre debe ser un texto" })
  @MinLength(3, { message: "El nombre debe tener al menos 3 caracteres" })
  @MaxLength(10, { message: "El nombre debe tener como máximo 10 caracteres" })
  @IsOptional()
  name?: string;

  @IsString({ message: "El apellido debe ser un texto" })
  @IsOptional()
  lastName?: string;

  @IsEmail({}, { message: "El correo no tiene un formato válido" })
  @IsNotEmpty({ message: "El correo es obligatorio" })
  @Validate(isEmailUnique)
  @IsOptional()
  email?: string;

  @IsInt({ message: "La edad debe ser un número entero" })
  @Min(11, { message: "La edad no puede ser menor a uno" })
  @IsOptional()
  age?: number;
}
