'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getPracticeQuestions, 
  createPracticeQuestion, 
  updatePracticeQuestion as updatePracticeQuestionApi, 
  deletePracticeQuestion as deletePracticeQuestionApi,
  PracticeQuestion,
  CreatePracticeQuestionDto
} from '@/app/lib/api/practice';

interface NewQuestionForm extends CreatePracticeQuestionDto {}

export default function AdminPracticePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PracticeQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState<NewQuestionForm>({
    type: 'text',
    word: '',
    translation: '',
    options: ['', '', '', ''],
    fillPrompt: '',
    answer: '',
  });

  // Auth protection
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      console.log('Not authenticated, redirecting to login');
      router.replace('/login');
    } else if (!loading && isAuthenticated && user && user.role !== 'admin') {
      console.log('Not admin, redirecting to unauthorized');
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchQuestions();
    }
  }, [isAuthenticated, user]);

  const fetchQuestions = async () => {
    try {
      setPageLoading(true);
      const data = await getPracticeQuestions();
      setQuestions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load practice questions');
    } finally {
      setPageLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      // Validate form based on question type
      if (newQuestion.type === 'text' && (!newQuestion.word || !newQuestion.translation)) {
        setError('Word and translation are required for text questions');
        return;
      }
      
      if (newQuestion.type === 'image' && (!newQuestion.imageUrl || !newQuestion.translation)) {
        setError('Image URL and translation are required for image questions');
        return;
      }
      
      if (newQuestion.type === 'fill' && (!newQuestion.fillPrompt || !newQuestion.answer || !newQuestion.translation)) {
        setError('Fill prompt, answer, and translation are required for fill-in-the-blank questions');
        return;
      }
      
      // For text and image questions, ensure options are provided and include the correct answer
      if ((newQuestion.type === 'text' || newQuestion.type === 'image') && 
          (!newQuestion.options || newQuestion.options.some(opt => !opt))) {
        setError('All four options are required for text and image questions');
        return;
      }
      
      if ((newQuestion.type === 'text' || newQuestion.type === 'image') && 
          !newQuestion.options?.includes(newQuestion.translation)) {
        setError('Options must include the correct translation');
        return;
      }

      const createdQuestion = await createPracticeQuestion(newQuestion);
      setQuestions([createdQuestion, ...questions]);
      
      // Reset form
      setNewQuestion({
        type: 'text',
        word: '',
        translation: '',
        options: ['', '', '', ''],
        fillPrompt: '',
        answer: '',
      });
      
      setShowAddQuestion(false);
      setError(null);
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add practice question');
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    
    try {
      // Same validation as add
      if (editingQuestion.type === 'text' && (!editingQuestion.word || !editingQuestion.translation)) {
        setError('Word and translation are required for text questions');
        return;
      }
      
      if (editingQuestion.type === 'image' && (!editingQuestion.imageUrl || !editingQuestion.translation)) {
        setError('Image URL and translation are required for image questions');
        return;
      }
      
      if (editingQuestion.type === 'fill' && (!editingQuestion.fillPrompt || !editingQuestion.answer || !editingQuestion.translation)) {
        setError('Fill prompt, answer, and translation are required for fill-in-the-blank questions');
        return;
      }
      
      if ((editingQuestion.type === 'text' || editingQuestion.type === 'image') && 
          (!editingQuestion.options || editingQuestion.options.some(opt => !opt))) {
        setError('All four options are required for text and image questions');
        return;
      }
      
      if ((editingQuestion.type === 'text' || editingQuestion.type === 'image') && 
          !editingQuestion.options?.includes(editingQuestion.translation)) {
        setError('Options must include the correct translation');
        return;
      }

      // Create a copy without createdAt and updatedAt
      const { createdAt, updatedAt, ...updateData } = editingQuestion;
      
      const updatedQuestion = await updatePracticeQuestionApi(editingQuestion.id, updateData);
      
      setQuestions(questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      ));
      
      setShowEditQuestion(false);
      setEditingQuestion(null);
      setError(null);
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update practice question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await deletePracticeQuestionApi(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete practice question');
    }
  };

  const handleEditQuestion = (question: PracticeQuestion) => {
    setEditingQuestion(question);
    setShowEditQuestion(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!newQuestion.options) return;
    
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({...newQuestion, options: updatedOptions});
  };

  const handleEditOptionChange = (index: number, value: string) => {
    if (!editingQuestion?.options) return;
    
    const updatedOptions = [...editingQuestion.options];
    updatedOptions[index] = value;
    setEditingQuestion({...editingQuestion, options: updatedOptions});
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Practice Question Management</h1>
        <button 
          onClick={() => setShowAddQuestion(true)}
          className="bg-[#ff6b8b] hover:bg-[#ff5277] text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Question
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {pageLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {questions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No practice questions found.</p>
              <button 
                onClick={() => setShowAddQuestion(true)}
                className="bg-[#ff6b8b] hover:bg-[#ff5277] text-white px-4 py-2 rounded-md"
              >
                Create Your First Question
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Translation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr key={question.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          question.type === 'text' ? 'bg-blue-100 text-blue-800' : 
                          question.type === 'image' ? 'bg-green-100 text-green-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {question.type === 'text' && (
                          <div className="text-sm text-gray-900">{question.word}</div>
                        )}
                        {question.type === 'image' && (
                          <div className="flex items-center">
                            {question.imageUrl ? (
                              <div className="h-10 w-10 relative">
                                <Image 
                                  src={question.imageUrl} 
                                  alt="Question image" 
                                  width={40}
                                  height={40}
                                  className="object-cover rounded"
                                />
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No image</div>
                            )}
                          </div>
                        )}
                        {question.type === 'fill' && (
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Prompt:</span> {question.fillPrompt}<br />
                            <span className="font-medium">Answer:</span> {question.answer}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{question.translation}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Practice Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as 'text' | 'image' | 'fill'})}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="fill">Fill in the Blank</option>
                </select>
              </div>

              {/* Text Question Fields */}
              {newQuestion.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newQuestion.word || ''}
                    onChange={(e) => setNewQuestion({...newQuestion, word: e.target.value})}
                  />
                </div>
              )}

              {/* Image Question Fields */}
              {newQuestion.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newQuestion.imageUrl || ''}
                    onChange={(e) => setNewQuestion({...newQuestion, imageUrl: e.target.value})}
                    placeholder="/images/example.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Images should be placed in the public/images folder
                  </p>
                </div>
              )}

              {/* Fill in the Blank Question Fields */}
              {newQuestion.type === 'fill' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fill Prompt (use _ for blanks)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={newQuestion.fillPrompt || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, fillPrompt: e.target.value})}
                      placeholder="H_ll_"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={newQuestion.answer || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, answer: e.target.value})}
                      placeholder="Hello"
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={newQuestion.translation}
                  onChange={(e) => setNewQuestion({...newQuestion, translation: e.target.value})}
                />
              </div>

              {/* Multiple Choice Options (for text and image questions) */}
              {(newQuestion.type === 'text' || newQuestion.type === 'image') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (include the correct translation)</label>
                  {newQuestion.options?.map((option, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-[#ff6b8b] hover:bg-[#ff5277] text-white rounded-md"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditQuestion && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Practice Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion({...editingQuestion, type: e.target.value as 'text' | 'image' | 'fill'})}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="fill">Fill in the Blank</option>
                </select>
              </div>

              {/* Text Question Fields */}
              {editingQuestion.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={editingQuestion.word || ''}
                    onChange={(e) => setEditingQuestion({...editingQuestion, word: e.target.value})}
                  />
                </div>
              )}

              {/* Image Question Fields */}
              {editingQuestion.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={editingQuestion.imageUrl || ''}
                    onChange={(e) => setEditingQuestion({...editingQuestion, imageUrl: e.target.value})}
                    placeholder="/images/example.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Images should be placed in the public/images folder
                  </p>
                </div>
              )}

              {/* Fill in the Blank Question Fields */}
              {editingQuestion.type === 'fill' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fill Prompt (use _ for blanks)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={editingQuestion.fillPrompt || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, fillPrompt: e.target.value})}
                      placeholder="H_ll_"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={editingQuestion.answer || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, answer: e.target.value})}
                      placeholder="Hello"
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={editingQuestion.translation}
                  onChange={(e) => setEditingQuestion({...editingQuestion, translation: e.target.value})}
                />
              </div>

              {/* Multiple Choice Options (for text and image questions) */}
              {(editingQuestion.type === 'text' || editingQuestion.type === 'image') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (include the correct translation)</label>
                  {editingQuestion.options?.map((option, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={option}
                        onChange={(e) => handleEditOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditQuestion(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuestion}
                className="px-4 py-2 bg-[#ff6b8b] hover:bg-[#ff5277] text-white rounded-md"
              >
                Update Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





