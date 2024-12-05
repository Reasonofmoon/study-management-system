# 모의고사 분석 시스템 (Study Management System)

학생들의 모의고사 결과를 체계적으로 분석하고 관리하기 위한 웹 기반 시스템입니다.

## 주요 기능

### 1. 시험 정보 관리
- 시험 날짜, 종류, 점수 등 기본 정보 입력
- 과목별 관리 기능
- 오답 문항 분석 및 기록

### 2. 미시적 분석
- 어휘력 평가 및 분석
- 문법 포인트 정리
- 오답 유형 분석
- 자주 틀리는 단어 추적

### 3. 거시적 분석
- 성적 추이 시각화
- 주제별 분석 요약
- 개선 영역 분석
- 학습 패턴 분석

### 4. 학습 계획 관리
- 일일/주간/월간/연간 목표 설정
- 개선점 추적
- 학습 계획 수립
- 진행 상황 모니터링

## 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/Reasonofmoon/study-management-system.git
cd study-management-system
```

2. 의존성 패키지 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm start
```

## 필수 패키지

- React.js
- Recharts (차트 시각화)
- Lucide React (아이콘)
- Tailwind CSS (스타일링)

## 프로젝트 구조

```
src/
├── components/
│   ├── ExamAnalysisSystem.js
│   ├── VocabularyTable.js
│   ├── SentenceAnalysis.js
│   ├── MacroAnalysis.js
│   └── ExamReflection.js
├── utils/
│   └── storage.js
├── App.js
└── index.js
```

## 사용 방법

1. 새로운 시험 기록 추가
   - '학습 일지' 탭에서 시험 정보 입력
   - 오답 분석 및 어휘/문법 포인트 기록

2. 분석 결과 확인
   - '성적 분석' 탭에서 다양한 통계 확인
   - 차트를 통한 시각적 분석

3. 학습 계획 수립
   - '학습 계획' 탭에서 목표 설정
   - 개선점 기록 및 추적

## 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 연락처

이메일: soundfury37@gmail.com
프로젝트 링크: https://github.com/Reasonofmoon/study-management-system