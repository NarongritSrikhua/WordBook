import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPreferencesDto } from './dto/user-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/set-admin')
  setAdmin(@Param('id') id: string) {
    return this.usersService.setAdmin(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/preferences')
  getUserPreferences(@Param('id') id: string, @Request() req) {
    // Only allow users to access their own preferences unless they're an admin
    if (req.user.userId !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only access your own preferences');
    }
    
    return this.usersService.getUserPreferences(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/preferences')
  updateUserPreferences(
    @Param('id') id: string, 
    @Body() preferencesDto: UserPreferencesDto,
    @Request() req
  ) {
    // Only allow users to update their own preferences unless they're an admin
    if (req.user.userId !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own preferences');
    }
    
    return this.usersService.updateUserPreferences(id, preferencesDto);
  }
}
