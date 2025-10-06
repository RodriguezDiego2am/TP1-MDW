import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsUrl,
  IsBoolean,
  MinLength,
  MaxLength,
  IsPositive
} from "class-validator";

export class UpdateProductDto {
  @IsString({ message: "El nombre debe ser un texto" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "El nombre debe tener como máximo 100 caracteres" })
  @IsOptional()
  name?: string;

  @IsString({ message: "La descripción debe ser un texto" })
  @MinLength(10, { message: "La descripción debe tener al menos 10 caracteres" })
  @MaxLength(500, { message: "La descripción debe tener como máximo 500 caracteres" })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: "El precio debe ser un número" })
  @IsPositive({ message: "El precio debe ser mayor a 0" })
  @IsOptional()
  price?: number;

  @IsString({ message: "La categoría debe ser un texto" })
  @MinLength(2, { message: "La categoría debe tener al menos 2 caracteres" })
  @MaxLength(50, { message: "La categoría debe tener como máximo 50 caracteres" })
  @IsOptional()
  category?: string;

  @IsNumber({}, { message: "El stock debe ser un número" })
  @Min(0, { message: "El stock no puede ser negativo" })
  @IsOptional()
  stock?: number;

  @IsString({ message: "La imagen debe ser un texto" })
  @IsUrl({}, { message: "La imagen debe ser una URL válida" })
  @IsOptional()
  image?: string;

  @IsBoolean({ message: "isActive debe ser un valor booleano" })
  @IsOptional()
  isActive?: boolean;
}