import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty() @IsEmail() @MaxLength(160) email!: string;
  @ApiProperty({ minLength: 12 }) @IsString() @MinLength(12) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/) password!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) displayName!: string;
  @ApiProperty({ enum: ['ADMINISTRADOR', 'GESTOR'] }) @IsIn(['ADMINISTRADOR', 'GESTOR']) role!: 'ADMINISTRADOR' | 'GESTOR';
}
export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) displayName?: string;
  @ApiPropertyOptional({ enum: ['ADMINISTRADOR', 'GESTOR'] }) @IsOptional() @IsIn(['ADMINISTRADOR', 'GESTOR']) role?: 'ADMINISTRADOR' | 'GESTOR';
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ResetPasswordDto {
  @ApiProperty({ minLength: 12 }) @IsString() @MinLength(12) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/) password!: string;
}
