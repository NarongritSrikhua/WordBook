import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPreferencesDto } from './dto/user-preferences.dto';
import * as bcrypt from 'bcrypt';

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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(updatedUser);
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
}

