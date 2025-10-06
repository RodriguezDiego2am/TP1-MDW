import {
  IsString,
  IsNotEmpty,
  IsMongoId
} from "class-validator";

export class RemoveFromCartDto {
  @IsString({ message: "El ID del producto debe ser un texto" })
  @IsNotEmpty({ message: "El ID del producto es obligatorio" })
  @IsMongoId({ message: "El ID del producto debe ser un ObjectId válido" })
  productId!: string;
}