// src/components/ExamAnalysisSystem.js
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Book,
  Brain,
  Target,
  Search,
  Layout,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
// 불필요한 컴포넌트 임포트 제거
// import VocabularyTable from './VocabularyTable';
// import SentenceAnalysis from './SentenceAnalysis';
// import MacroAnalysis from './MacroAnalysis';
// import ExamReflection from './ExamReflection';
import { loadNotes, saveNotes, loadSubjects, saveSubjects } from '../utils/storage';

const DEFAULT_SUBJECTS = {
  korean: '국어',
  english: '영어',
  math: '수학',
  science: '과학',
  social: '사회'
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

const defaultNote = {
  testDate: new Date().toISOString().split('T')[0],
  examType: '',
  examName: '',
  subject: '',
  score: '',
  totalQuestions: 0,
  wrongAnswers: [],
  vocabularyList: [],
  sentenceAnalysis: [],
  macroAnalysis: [],
  microAnalysis: {
    vocabularyRating: 0,
    unknownWords: [],
    grammarPoints: []
  },
  reflection: {
    difficulty: '',
    condition: '',
    improvements: [],
    nextSteps: []
  },
  goals: {
    daily: '',
    weekly: '',
    monthly: '',
    yearly: ''
  }
};

const ExamAnalysisSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('daily');
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [currentNote, setCurrentNote] = useState(defaultNote);
  const [editMode, setEditMode] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadedNotes = loadNotes();
    const loadedSubjects = loadSubjects();

    setNotes(loadedNotes);
    setSubjects(Object.keys(loadedSubjects).length === 0 ? DEFAULT_SUBJECTS : loadedSubjects);
  }, []);

  // 데이터 자동 저장
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!currentNote.examType || !currentNote.subject || !currentNote.score) {
      alert('시험 종류, 과목, 점수는 필수 입력 항목입니다.');
      return;
    }

    const score = parseFloat(currentNote.score);
    if (isNaN(score) || score < 0 || score > 100) {
      alert('점수는 0에서 100 사이의 숫자여야 합니다.');
      return;
    }

    if (editMode) {
      setNotes(notes.map(note =>
        note.id === currentNote.id ? currentNote : note
      ));
    } else {
      const newNote = {
        ...currentNote,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setNotes([...notes, newNote]);
    }

    // 폼 초기화
    setCurrentNote(defaultNote);
    setEditMode(false);
  };

  const handleDelete = (noteId) => {
    if (window.confirm('정말 이 기록을 삭제하시겠습니까?')) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
  };

  const handleEdit = (noteId) => {
    const noteToEdit = notes.find(note => note.id === noteId);
    if (noteToEdit) {
      setCurrentNote(noteToEdit);
      setEditMode(true);
      setActiveTab('overview');
    }
  };

  const getFilteredNotes = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return notes.filter(note => {
      const noteDate = new Date(note.testDate);
      switch(viewMode) {
        case 'daily':
          return noteDate >= startOfDay;
        case 'weekly':
          const weekAgo = new Date(startOfDay);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return noteDate >= weekAgo;
        case 'monthly':
          return noteDate.getMonth() === now.getMonth() &&
                 noteDate.getFullYear() === now.getFullYear();
        case 'yearly':
          return noteDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
  };

  // 분석 함수들
  const getAnalytics = () => {
    const filteredNotes = getFilteredNotes();
    return {
      scoreProgress: calculateScoreProgress(filteredNotes),
      weakPoints: identifyWeakPoints(filteredNotes),
      vocabularyStats: analyzeVocabulary(filteredNotes),
      improvementAreas: findImprovementAreas(filteredNotes)
    };
  };

  const calculateScoreProgress = (notes) => {
    return notes.map(note => ({
      date: new Date(note.testDate).toLocaleDateString(),
      score: parseFloat(note.score) || 0,
      subject: subjects[note.subject]
    }));
  };

  const identifyWeakPoints = (notes) => {
    const weakPoints = {};
    notes.forEach(note => {
      note.wrongAnswers.forEach(wrong => {
        if (!weakPoints[wrong.type]) {
          weakPoints[wrong.type] = 0;
        }
        weakPoints[wrong.type]++;
      });
    });
    return Object.entries(weakPoints).map(([type, count]) => ({
      type,
      count
    }));
  };

  const analyzeVocabulary = (notes) => {
    const words = {};
    notes.forEach(note => {
      note.microAnalysis.unknownWords.forEach(word => {
        if (!words[word.term]) {
          words[word.term] = 0;
        }
        words[word.term]++;
      });
    });
    return Object.entries(words)
      .map(([word, frequency]) => ({ word, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  };

  const findImprovementAreas = (notes) => {
    const areas = new Set();
    notes.forEach(note => {
      note.reflection.improvements.forEach(improvement => {
        if (improvement.trim() !== '') { // 빈 문자열 제외
          areas.add(improvement);
        }
      });
    });
    return Array.from(areas);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6">모의고사 분석 시스템</h1>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-4 py-2 rounded ${
                activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <Book className="w-4 h-4 mr-2" />
              시험 개요
            </button>
            <button
              onClick={() => setActiveTab('micro')}
              className={`flex items-center px-4 py-2 rounded ${
                activeTab === 'micro' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <Search className="w-4 h-4 mr-2" />
              미시적 분석
            </button>
            <button
              onClick={() => setActiveTab('macro')}
              className={`flex items-center px-4 py-2 rounded ${
                activeTab === 'macro' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <Layout className="w-4 h-4 mr-2" />
              거시적 분석
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center px-4 py-2 rounded ${
                activeTab === 'plan' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              학습 계획
            </button>
          </div>

          {/* Time Period Selection */}
          <div className="flex space-x-4 mb-6">
            {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
              <button
                key={period}
                onClick={() => setViewMode(period)}
                className={`px-4 py-2 rounded ${
                  viewMode === period ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {period === 'daily' ? '일간' :
                 period === 'weekly' ? '주간' :
                 period === 'monthly' ? '월간' : '연간'}
              </button>
            ))}
          </div>

          {/* Main Content */}
          {activeTab === 'overview' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">시험 날짜</label>
                  <input
                    type="date"
                    value={currentNote.testDate}
                    onChange={(e) => setCurrentNote({ ...currentNote, testDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">시험 종류</label>
                  <input
                    type="text"
                    value={currentNote.examType}
                    onChange={(e) => setCurrentNote({ ...currentNote, examType: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="예: 6월 모의고사"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">시험 이름</label>
                <input
                  type="text"
                  value={currentNote.examName}
                  onChange={(e) => setCurrentNote({ ...currentNote, examName: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="예: 2024학년도 대학수학능력시험 모의평가"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">과목</label>
                  <select
                    value={currentNote.subject}
                    onChange={(e) => setCurrentNote({ ...currentNote, subject: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">선택하세요</option>
                    {Object.entries(subjects).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">점수</label>
                  <input
                    type="number"
                    value={currentNote.score}
                    onChange={(e) => setCurrentNote({ ...currentNote, score: e.target.value })}
                    className="w-full p-2 border rounded"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
  			  			  
		          <div>
                <label className="block text-sm font-medium mb-2">틀린 문항 분석</label>
                {currentNote.wrongAnswers.map((wrong, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <input
                        type="number"
                        value={wrong.questionNumber}
                        onChange={(e) => {
                          const newWrongAnswers = [...currentNote.wrongAnswers];
                          newWrongAnswers[index].questionNumber = parseInt(e.target.value);
                          setCurrentNote({ ...currentNote, wrongAnswers: newWrongAnswers });
                        }}
                        className="p-2 border rounded"
                        placeholder="문항 번호"
                      />
                      <select
                        value={wrong.type}
                        onChange={(e) => {
                          const newWrongAnswers = [...currentNote.wrongAnswers];
                          newWrongAnswers[index].type = e.target.value;
                          setCurrentNote({ ...currentNote, wrongAnswers: newWrongAnswers });
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="">유형 선택</option>
                        <option value="vocabulary">어휘</option>
                        <option value="grammar">문법</option>
                        <option value="reading">독해</option>
                        <option value="listening">듣기</option>
                      </select>
                    </div>
                    <textarea
                      value={wrong.analysis}
                      onChange={(e) => {
                        const newWrongAnswers = [...currentNote.wrongAnswers];
                        newWrongAnswers[index].analysis = e.target.value;
                        setCurrentNote({ ...currentNote, wrongAnswers: newWrongAnswers });
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="오답 분석을 입력하세요..."
                      rows="3"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newWrongAnswers = currentNote.wrongAnswers.filter((_, i) => i !== index);
                        setCurrentNote({ ...currentNote, wrongAnswers: newWrongAnswers });
                      }}
                      className="mt-2 text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentNote({
                      ...currentNote,
                      wrongAnswers: [...currentNote.wrongAnswers, { questionNumber: '', type: '', analysis: '' }]
                    });
                  }}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> 틀린 문항 추가
                </button>
              </div>

              {/* 어휘 분석 */}
              <div>
                <label className="block text-sm font-medium mb-2">어휘 체감도 (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentNote.microAnalysis.vocabularyRating}
                  onChange={(e) => setCurrentNote({
                    ...currentNote,
                    microAnalysis: {
                      ...currentNote.microAnalysis,
                      vocabularyRating: parseInt(e.target.value)
                    }
                  })}
                  className="w-full"
                />
                <div className="text-center">
                  {currentNote.microAnalysis.vocabularyRating}/10
                </div>
              </div>

              {/* 모르는 단어 리스트 */}
              <div>
                <label className="block text-sm font-medium mb-2">모르는 단어 리스트</label>
                <div className="grid grid-cols-2 gap-4">
                  {currentNote.microAnalysis.unknownWords.map((word, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={word.term}
                        onChange={(e) => {
                          const newWords = [...currentNote.microAnalysis.unknownWords];
                          newWords[index].term = e.target.value;
                          setCurrentNote({
                            ...currentNote,
                            microAnalysis: {
                              ...currentNote.microAnalysis,
                              unknownWords: newWords
                            }
                          });
                        }}
                        className="flex-1 p-2 border rounded"
                        placeholder="단어"
                      />
                      <input
                        type="text"
                        value={word.meaning}
                        onChange={(e) => {
                          const newWords = [...currentNote.microAnalysis.unknownWords];
                          newWords[index].meaning = e.target.value;
                          setCurrentNote({
                            ...currentNote,
                            microAnalysis: {
                              ...currentNote.microAnalysis,
                              unknownWords: newWords
                            }
                          });
                        }}
                        className="flex-1 p-2 border rounded"
                        placeholder="의미"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newWords = currentNote.microAnalysis.unknownWords.filter((_, i) => i !== index);
                          setCurrentNote({
                            ...currentNote,
                            microAnalysis: {
                              ...currentNote.microAnalysis,
                              unknownWords: newWords
                            }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentNote({
                      ...currentNote,
                      microAnalysis: {
                        ...currentNote.microAnalysis,
                        unknownWords: [...currentNote.microAnalysis.unknownWords, { term: '', meaning: '' }]
                      }
                    });
                  }}
                  className="mt-2 flex items-center text-blue-500 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> 단어 추가
                </button>
              </div>

              {/* 문법 포인트 */}
              <div>
                <label className="block text-sm font-medium mb-2">문법 포인트</label>
                {currentNote.microAnalysis.grammarPoints.map((point, index) => (
                  <div key={index} className="mb-4">
                    <textarea
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...currentNote.microAnalysis.grammarPoints];
                        newPoints[index] = e.target.value;
                        setCurrentNote({
                          ...currentNote,
                          microAnalysis: {
                            ...currentNote.microAnalysis,
                            grammarPoints: newPoints
                          }
                        });
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="문법 포인트를 입력하세요..."
                      rows="2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPoints = currentNote.microAnalysis.grammarPoints.filter((_, i) => i !== index);
                        setCurrentNote({
                          ...currentNote,
                          microAnalysis: {
                            ...currentNote.microAnalysis,
                            grammarPoints: newPoints
                          }
                        });
                      }}
                      className="mt-1 text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentNote({
                      ...currentNote,
                      microAnalysis: {
                        ...currentNote.microAnalysis,
                        grammarPoints: [...currentNote.microAnalysis.grammarPoints, '']
                      }
                    });
                  }}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> 문법 포인트 추가
                </button>
              </div>
  			  
  			  {/* 거시적 분석 */}
              <div>
                <label className="block text-sm font-medium mb-2">거시적 분석</label>
                {currentNote.macroAnalysis.map((analysis, index) => (
                  <div key={index} className="mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <select
                        value={analysis.type}
                        onChange={(e) => {
                          const newAnalysis = [...currentNote.macroAnalysis];
                          newAnalysis[index].type = e.target.value;
                          setCurrentNote({ ...currentNote, macroAnalysis: newAnalysis });
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="">유형 선택</option>
                        <option value="theme">주제 파악</option>
                        <option value="structure">지문 구조</option>
                        <option value="argument">논지 전개</option>
                        <option value="conclusion">결론 도출</option>
                      </select>
                      <input
                        type="text"
                        value={analysis.questionRange}
                        onChange={(e) => {
                          const newAnalysis = [...currentNote.macroAnalysis];
                          newAnalysis[index].questionRange = e.target.value;
                          setCurrentNote({ ...currentNote, macroAnalysis: newAnalysis });
                        }}
                        className="p-2 border rounded"
                        placeholder="문항 범위 (예: 20-24)"
                      />
                    </div>
                    <textarea
                      value={analysis.content}
                      onChange={(e) => {
                        const newAnalysis = [...currentNote.macroAnalysis];
                        newAnalysis[index].content = e.target.value;
                        setCurrentNote({ ...currentNote, macroAnalysis: newAnalysis });
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="거시적 분석 내용을 입력하세요..."
                      rows="4"
                    />
                    <div className="mt-2">
                      <input
                        type="text"
                        value={analysis.improvement}
                        onChange={(e) => {
                          const newAnalysis = [...currentNote.macroAnalysis];
                          newAnalysis[index].improvement = e.target.value;
                          setCurrentNote({ ...currentNote, macroAnalysis: newAnalysis });
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="개선 방안"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newAnalysis = currentNote.macroAnalysis.filter((_, i) => i !== index);
                        setCurrentNote({ ...currentNote, macroAnalysis: newAnalysis });
                      }}
                      className="mt-2 text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentNote({
                      ...currentNote,
                      macroAnalysis: [
                        ...currentNote.macroAnalysis,
                        { type: '', questionRange: '', content: '', improvement: '' }
                      ]
                    });
                  }}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> 거시적 분석 추가
                </button>
              </div>

              {/* 시험 리플렉션 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">체감 난이도</label>
                  <select
                    value={currentNote.reflection.difficulty}
                    onChange={(e) => setCurrentNote({
                      ...currentNote,
                      reflection: {
                        ...currentNote.reflection,
                        difficulty: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">선택하세요</option>
                    <option value="very-easy">매우 쉬움</option>
                    <option value="easy">쉬움</option>
                    <option value="moderate">보통</option>
                    <option value="hard">어려움</option>
                    <option value="very-hard">매우 어려움</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">시험 당일 컨디션</label>
                  <textarea
                    value={currentNote.reflection.condition}
                    onChange={(e) => setCurrentNote({
                      ...currentNote,
                      reflection: {
                        ...currentNote.reflection,
                        condition: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded"
                    placeholder="시험 당일의 컨디션과 특이사항을 기록하세요..."
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">개선점</label>
                  {currentNote.reflection.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={improvement}
                        onChange={(e) => {
                          const newImprovements = [...currentNote.reflection.improvements];
                          newImprovements[index] = e.target.value;
                          setCurrentNote({
                            ...currentNote,
                            reflection: {
                              ...currentNote.reflection,
                              improvements: newImprovements
                            }
                          });
                        }}
                        className="flex-1 p-2 border rounded"
                        placeholder="개선이 필요한 부분"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImprovements = currentNote.reflection.improvements.filter((_, i) => i !== index);
                          setCurrentNote({
                            ...currentNote,
                            reflection: {
                              ...currentNote.reflection,
                              improvements: newImprovements
                            }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentNote({
                        ...currentNote,
                        reflection: {
                          ...currentNote.reflection,
                          improvements: [...currentNote.reflection.improvements, '']
                        }
                      });
                    }}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" /> 개선점 추가
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">다음 단계 계획</label>
                  {currentNote.reflection.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...currentNote.reflection.nextSteps];
                          newSteps[index] = e.target.value;
                          setCurrentNote({
                            ...currentNote,
                            reflection: {
                              ...currentNote.reflection,
                              nextSteps: newSteps
                            }
                          });
                        }}
                        className="flex-1 p-2 border rounded"
                        placeholder="다음 학습 단계"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = currentNote.reflection.nextSteps.filter((_, i) => i !== index);
                          setCurrentNote({
                            ...currentNote,
                            reflection: {
                              ...currentNote.reflection,
                              nextSteps: newSteps
                            }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentNote({
                        ...currentNote,
                        reflection: {
                          ...currentNote.reflection,
                          nextSteps: [...currentNote.reflection.nextSteps, '']
                        }
                      });
                    }}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" /> 다음 단계 추가
                  </button>
                </div>
              </div>
  			  
  			  
  			  {/* 학습 목표 설정 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">학습 목표 설정</h3>
                {Object.entries({
                  daily: '일일',
                  weekly: '주간',
                  monthly: '월간',
                  yearly: '연간'
                }).map(([period, label]) => (
                  <div key={period}>
                    <label className="block text-sm font-medium mb-2">{label} 목표</label>
                    <textarea
                      value={currentNote.goals[period]}
                      onChange={(e) => setCurrentNote({
                        ...currentNote,
                        goals: {
                          ...currentNote.goals,
                          [period]: e.target.value
                        }
                      })}
                      className="w-full p-2 border rounded h-24"
                      placeholder={`${label} 학습 목표를 작성해주세요...`}
                    />
                  </div>
                ))}
              </div>

              {/* 제출 버튼 */}
              <div className="mt-8 flex justify-end">
                {editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentNote(defaultNote);
                      setEditMode(false);
                    }}
                    className="mr-4 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editMode ? '수정 완료' : '저장하기'}
                </button>
              </div>
            </form>
          )}

          {/* 성적 분석 차트 */}
          {activeTab === 'micro' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                {/* 어휘 분석 파트 */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">어휘 분석</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">자주 틀리는 단어</h4>
                      <div className="max-h-60 overflow-y-auto">
                        {analyzeVocabulary(getFilteredNotes()).map((word, index) => (
                          <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50">
                            <span>{word.word}</span>
                            <span className="text-gray-500 text-sm">{word.frequency}회</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">어휘 체감도 추이</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getFilteredNotes()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="testDate" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="microAnalysis.vocabularyRating" 
                            stroke="#8884d8"
                            name="어휘 체감도"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 문법 분석 파트 */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">문법 포인트 분석</h3>
                  <div className="max-h-96 overflow-y-auto">
                    {getFilteredNotes().map((note) => (
                      <div key={note.id} className="mb-4 p-4 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500 mb-2">{note.testDate}</div>
                        {note.microAnalysis.grammarPoints.map((point, index) => (
                          <div key={index} className="mb-2 pl-4 border-l-2 border-blue-500">
                            {point}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 오답 유형 분석 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">오답 유형 분석</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium mb-2">유형별 오답 빈도</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={identifyWeakPoints(getFilteredNotes())}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#82ca9d" name="오답 횟수" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">자주 틀리는 유형 Top 5</h4>
                    <div className="space-y-2">
                      {identifyWeakPoints(getFilteredNotes())
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5)
                        .map((point, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{point.type}</span>
                            <span className="text-gray-500">{point.count}회</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 거시적 분석 차트 */}
          {activeTab === 'macro' && (
            <div className="space-y-8">
              {/* 성적 추이 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">성적 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculateScoreProgress(getFilteredNotes())}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      name="점수"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 주제별 분석 요약 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">주제별 분석 요약</h3>
                  <div className="space-y-4">
                    {getFilteredNotes().map(note => note.macroAnalysis)
                      .flat()
                      .filter(analysis => analysis.type === 'theme')
                      .map((analysis, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded">
                          <div className="text-sm text-gray-500 mb-2">문항 {analysis.questionRange}</div>
                          <div className="mb-2">{analysis.content}</div>
                          <div className="text-blue-500">→ {analysis.improvement}</div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">개선 영역 분석</h3>
                  <div className="space-y-4">
                    {findImprovementAreas(getFilteredNotes()).map((area, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded">
                        <div className="font-medium mb-2">{area}</div>
                        <div className="text-sm text-gray-600">
                          관련 문항: {getFilteredNotes()
                            .filter(note => note.reflection.improvements.includes(area))
                            .map(note => note.testDate)
                            .join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 학습 계획 */}
          {activeTab === 'plan' && (
            <div className="space-y-8">
              {/* 목표 달성도 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">목표 달성도</h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries({
                    daily: '일일',
                    weekly: '주간',
                    monthly: '월간',
                    yearly: '연간'
                  }).map(([period, label]) => (
                    <div key={period} className="p-4 bg-gray-50 rounded">
                      <div className="text-sm font-medium mb-2">{label} 목표</div>
                      {currentNote.goals[period] ? (
                        <p>{currentNote.goals[period]}</p>
                      ) : (
                        <p className="text-gray-500">설정된 목표 없음</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 학습 계획 수립 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">학습 계획 수립</h3>
                <div className="space-y-4">
                  {currentNote.reflection.nextSteps.map((step, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded">
                      <div className="font-medium mb-2">Step {index + 1}</div>
                      <div>{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 개선 이력 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">개선 이력</h3>
                <div className="space-y-4">
                  {getFilteredNotes().map(note => (
                    <div key={note.id} className="p-4 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500 mb-2">{note.testDate}</div>
                      <div className="space-y-2">
                        {note.reflection.improvements.map((improvement, index) => (
                          <div key={index} className="pl-4 border-l-2 border-blue-500">
                            {improvement}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamAnalysisSystem;
