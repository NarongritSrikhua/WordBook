'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { 
  getPracticeQuestion, 
  deletePracticeQuestion,
  PracticeQuestion
} from '@/app/lib/api/practice';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function PracticeQuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  
  // Rest of the component remains the same