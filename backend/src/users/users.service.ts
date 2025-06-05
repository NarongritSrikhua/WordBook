import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPreferencesDto } from './dto/user-preferences.dto';
import * as bcrypt from 'bcrypt';
import { MoreThan } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: createUserDto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { 
        resetToken: token,
        resetTokenExpires: MoreThan(new Date())
      } 
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    console.log('Updating user:', { id, updateUserDto });
    
    const user = await this.findOne(id);
    console.log('Found user:', { id: user.id, email: user.email });
    
    // Create a new object to hold the updates
    const updates: Partial<User> = {};
    
    // Handle password update separately
    if (updateUserDto.password) {
      console.log('Hashing new password');
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      console.log('Password hashed:', {
        originalLength: updateUserDto.password.length,
        hashedLength: hashedPassword.length
      });
      updates.password = hashedPassword;
    }
    
    // Handle other fields
    if (updateUserDto.resetToken !== undefined) {
      updates.resetToken = updateUserDto.resetToken;
    }
    if (updateUserDto.resetTokenExpires !== undefined) {
      updates.resetTokenExpires = updateUserDto.resetTokenExpires;
    }
    if (updateUserDto.name) {
      updates.name = updateUserDto.name;
    }
    if (updateUserDto.email) {
      updates.email = updateUserDto.email;
    }
    if (updateUserDto.role) {
      updates.role = updateUserDto.role;
    }
    if (updateUserDto.lastLoginAt) {
      updates.lastLoginAt = updateUserDto.lastLoginAt;
    }
    
    console.log('Applying updates:', { 
      hasPassword: !!updates.password,
      hasResetToken: updates.resetToken !== undefined,
      hasResetTokenExpires: updates.resetTokenExpires !== undefined
    });
    
    // Update the user
    Object.assign(user, updates);
    
    // Save the user
    const savedUser = await this.usersRepository.save(user);
    
    // Verify the update
    const verifiedUser = await this.usersRepository.findOne({ where: { id } });
    if (verifiedUser) {
      console.log('Verification after save:', {
        id: verifiedUser.id,
        email: verifiedUser.email,
        hasPassword: !!verifiedUser.password,
        passwordLength: verifiedUser.password?.length,
        hasResetToken: !!verifiedUser.resetToken,
        resetTokenExpires: verifiedUser.resetTokenExpires
      });

      // If this was a password update, verify it
      if (updateUserDto.password) {
        const isPasswordValid = await bcrypt.compare(updateUserDto.password, verifiedUser.password);
        console.log('Password verification after save:', { isPasswordValid });
        if (!isPasswordValid) {
          throw new Error('Password verification failed after save');
        }
      }
    } else {
      console.error('Failed to verify user update - user not found after save');
      throw new Error('Failed to verify user update');
    }
    
    return savedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async setAdmin(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.role = UserRole.ADMIN;
    return this.usersRepository.save(user);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const preferences = await this.preferencesRepository.findOne({ 
      where: { userId } 
    });
    
    if (!preferences) {
      // Create default preferences if none exist
      const newPreferences = this.preferencesRepository.create({
        userId,
        level: 'Beginner',
        targetLanguage: 'Thai',
        dailyGoal: '15 minutes',
        theme: 'light',
        notifications: true,
        soundEffects: true
      });
      
      return this.preferencesRepository.save(newPreferences);
    }
    
    return preferences;
  }

  async updateUserPreferences(userId: string, preferencesDto: UserPreferencesDto): Promise<UserPreferences> {
    // Check if user exists
    await this.findOne(userId);
    
    // Find existing preferences or create new ones
    let preferences = await this.preferencesRepository.findOne({ 
      where: { userId } 
    });
    
    if (!preferences) {
      preferences = this.preferencesRepository.create({
        userId,
        ...preferencesDto
      });
    } else {
      // Update existing preferences
      this.preferencesRepository.merge(preferences, preferencesDto);
    }
    
    return this.preferencesRepository.save(preferences);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<User> {
    console.log('Changing password for user:', { id });
    
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and update new password
    console.log('Hashing new password');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Password hashed:', {
      originalLength: newPassword.length,
      hashedLength: hashedPassword.length
    });

    // Update user with new password
    const updatedUser = await this.update(id, { password: newPassword });

    // Verify the update
    const verifiedUser = await this.usersRepository.findOne({ where: { id } });
    if (verifiedUser) {
      const isPasswordValid = await bcrypt.compare(newPassword, verifiedUser.password);
      console.log('Password verification after save:', { isPasswordValid });
      if (!isPasswordValid) {
        throw new Error('Password verification failed after save');
      }
    } else {
      console.error('Failed to verify user update - user not found after save');
      throw new Error('Failed to verify user update');
    }

    return updatedUser;
  }
}

