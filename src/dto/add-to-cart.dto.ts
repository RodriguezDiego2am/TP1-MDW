import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsMongoId
} from "class-validator";

export class AddToCartDto {
  @IsString({ message: "El ID del producto debe ser un texto" })
  @IsNotEmpty({ message: "El ID del producto es obligatorio" })
  @IsMongoId({ message: "El ID del producto debe ser un ObjectId válido" })
  productId!: string;

  @IsNumber({}, { message: "La cantidad debe ser un número" })
  @IsPositive({ message: "La cantidad debe ser mayor a 0" })
  @IsNotEmpty({ message: "La cantidad es obligatoria" })
  quantity!: number;
}