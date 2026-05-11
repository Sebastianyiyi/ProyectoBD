import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('microsoft')
  loginConMicrosoft(@Body() dto: MicrosoftLoginDto) {
    return this.authService.loginConMicrosoft(dto);
  }
}
