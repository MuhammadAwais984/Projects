import { IsEmail, IsString, MinLength } from 'class-validator';
export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() name?: string;
  @IsString() cnic?: string;
  @IsString() phone?: string; // Consider using enum validation if Role is an enum
}
