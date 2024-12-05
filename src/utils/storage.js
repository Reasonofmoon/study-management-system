// src/utils/storage.js

// 로컬 스토리지 키 상수
const STORAGE_KEYS = {
    NOTES: 'studyNotes',
    SUBJECTS: 'subjects',
    SETTINGS: 'settings'
};

// 학습 노트 저장
export const saveNotes = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving notes:', error);
    return false;
  }
};

// 학습 노트 불러오기
export const loadNotes = () => {
  try {
    const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

// 과목 정보 저장
export const saveSubjects = (subjects) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    return true;
  } catch (error) {
    console.error('Error saving subjects:', error);
    return false;
  }
};

// 과목 정보 불러오기
export const loadSubjects = () => {
  try {
    const subjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return subjects ? JSON.parse(subjects) : {};
  } catch (error) {
    console.error('Error loading subjects:', error);
    return {};
  }
};

// 설정 저장
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// 설정 불러오기
export const loadSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {};
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
};

// 특정 노트 삭제
export const deleteNote = (noteId) => {
  try {
    const notes = loadNotes();
    const updatedNotes = notes.filter(note => note.id !== noteId);
    return saveNotes(updatedNotes);
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
};

// 특정 노트 수정
export const updateNote = (noteId, updatedData) => {
  try {
    const notes = loadNotes();
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, ...updatedData } : note
    );
    return saveNotes(updatedNotes);
  } catch (error) {
    console.error('Error updating note:', error);
    return false;
  }
};

// 모든 데이터 초기화
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
