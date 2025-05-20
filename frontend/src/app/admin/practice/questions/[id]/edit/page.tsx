'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { 
  getPracticeQuestion, 
  updatePracticeQuestion,
  PracticeQuestion,
  Difficulty
} from '@/app/lib/api/practice';
import { getCategories, Category } from '@/app/lib/api/categories';

export default function EditPracticeQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  // Rest of the component remains the same