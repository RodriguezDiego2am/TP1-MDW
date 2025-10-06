import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsUrl,
  IsBoolean,
  MinLength,
  MaxLength,
  IsPositive
} from "class-validator";

export class CreateProductDto {
  @IsString({ message: "El nombre debe ser un texto" })
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "El nombre debe tener como máximo 100 caracteres" })
  name!: string;

  @IsString({ message: "La descripción debe ser un texto" })
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  @MinLength(10, { message: "La descripción debe tener al menos 10 caracteres" })
  @MaxLength(500, { message: "La descripción debe tener como máximo 500 caracteres" })
  description!: string;

  @IsNumber({}, { message: "El precio debe ser un número" })
  @IsPositive({ message: "El precio debe ser mayor a 0" })
  @IsNotEmpty({ message: "El precio es obligatorio" })
  price!: number;

  @IsString({ message: "La categoría debe ser un texto" })
  @IsNotEmpty({ message: "La categoría es obligatoria" })
  @MinLength(2, { message: "La categoría debe tener al menos 2 caracteres" })
  @MaxLength(50, { message: "La categoría debe tener como máximo 50 caracteres" })
  category!: string;

  @IsNumber({}, { message: "El stock debe ser un número" })
  @Min(0, { message: "El stock no puede ser negativo" })
  @IsNotEmpty({ message: "El stock es obligatorio" })
  stock!: number;

  @IsString({ message: "La imagen debe ser un texto" })
  @IsUrl({}, { message: "La imagen debe ser una URL válida" })
  @IsOptional()
  image?: string;

  @IsBoolean({ message: "isActive debe ser un valor booleano" })
  @IsOptional()
  isActive?: boolean;
}