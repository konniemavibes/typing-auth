"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BarsArrowUpIcon,
  ArrowRightCircleIcon 
} from "@heroicons/react/24/outline";

import { MobileKeyboard } from '../components/MobileKeyboard';
import { useRouter } from 'next/navigation';

// Lessons data structure
const lessons = [
  {
    id: 1,
    title: "Beginner - Home Row",
    difficulty: "Easy",
    sentences: [
      "asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; home row keys practice jksa salsa practice saadf flad klad; ;asdf",
      "the fast dad had a salad with fresh kale the fast dad had a salad with fresh kale the fast dad had a salad with fresh kale the fast dad had a salad with fresh kale the fast dad had a salad with fresh kale the fast dad had",
      "sad lad falls and asks for help from dad sad lad falls and asks for help from dad sad lad falls and asks for help from dad sad lad falls and asks for help from dad sad lad falls and asks for help from dad sad lad falls and ",
      "jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjffj jffjjf fjjff",
    ]
  },
  {
    id: 2,
    title: "Intermediate - Top Row",
    difficulty: "Medium",
    sentences: [
      "qwerty uiop type your query write pure power type your query qwerty uiop try your power write type qwerty uiop your pure power write type query qwerty uiop try your power type write query qwerty uiop pure your wer",
      "the quick writer types poetry every day the quick writer types poetry every day the quick writer types poetry every day the quick writer types poetry every day the quick writer types poetry every day the quick writer types",
      "you require proper posture to type well you require proper posture to type well you require proper posture to type well you require proper posture to type well you require proper posture to type well you require proper posture",
    ]
  },
  {
    id: 3,
    title: "Advanced - Bottom Row",
    difficulty: "Medium",
    sentences: [
      "zxcvbnm practice bottom row typing skills zxcvbnm practice bottom row typing skills zxcvbnm practice bottom row typing skills zxcvbnm practice bottom row typing skills zxcvbnm practice bottom row typing skills zxcvbnm practice bottom row typing",
      "the zebra can move nimbly across vast terrain the zebra can move nimbly across vast terrain the zebra can move nimbly across vast terrain the zebra can move nimbly across vast terrain the zebra can move nimbly across vast terrain the zebra can move nimbly across",
      "mix carbon and zinc to create new compounds mix carbon and zinc to create new compounds mix carbon and zinc to create new compounds mix carbon and zinc to create new compounds mix carbon and zinc to create new compounds mix carbon and zinc to create",
    ]
  },
  {
    id: 4,
    title: "Expert - Full Keyboard",
    difficulty: "Hard",
    sentences: [
      "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over",
      "practice makes perfect when learning to type practice makes perfect when learning to type practice makes perfect when learning to type practice makes perfect when learning to type practice makes perfect when learning to type practice makes perfect when learning",
      "coding is the language of the future coding is the language of the future coding is the language of the future coding is the language of the future coding is the language of the future coding is the language of the future coding is the language of the future ",
    ]
  },
  {
    id: 5,
    title: "Numbers Practice",
    difficulty: "Medium",
    sentences: [
      "type 123 456 789 and 0 to practice numbers type 123 456 789 and 0 to practice numbers type 123 456 789 and 0 to practice numbers type 123 456 789 and 0 to practice numbers type 123 456 789 and 0 to practice numbers type 123 456 789 and 0 to practice",
      "the year 2024 has 365 days in total the year 2024 has 365 days in total the year 2024 has 365 days in total the year 2024 has 365 days in total the year 2024 has 365 days in total the year 2024 has 365 days in",
      "call 5551234 for more information today call 5551234 for more information today call 5551234 for more information today call 5551234 for more information today call 5551234 for more information today call 5551234 for more information",
    ]
  },
  {
    id: 6,
    title: "Special Characters",
    difficulty: "Hard",
    sentences: [
       "Use symbols like @#$%^&*() in your typing. Use symbols like @#$%^&*() in your typing. Use symbols like @#$%^&*() in your typing. Use symbols like @#$%^&*() in your typing. Use symbols like @#$%^&*() in your typing. Use symbols like @#$%^&*() in your",
      "Email: user@example.com, Password: Pass123! Email: user@example.com, Password: Pass123! Email: user@example.com, Password: Pass123! Email: user@example.com, Password: Pass123! Email: user@example.com, Password: Pass123! Email: user@example.com, Password: Pass123! Email: user@example.com, Password: Pass123",
      "Calculate: (10 + 5) * 2 = 30 results. Calculate: (10 + 5) * 2 = 30 results. Calculate: (10 + 5) * 2 = 30 results. Calculate: (10 + 5) * 2 = 30 results. Calculate: (10 + 5) * 2 = 30 results. Calculate: (10 + 5) * 2 = 30 results. Calculate: (10 + 5) * 2 = 30",
      "import React from 'react'; import React-dom from 'react/client'; const App = () => { return <div>Hello World</div>; }; export default App; import React from 'react'; import React-dom from 'react/client'; const App = () => { return <div>Hello World</div>; };",
    ]
  }
];

const StatPanel = ({ icon, value, label, unit = "", color, className = "" }) => (
  <div className={`
    p-6 rounded-xl bg-slate-800/90 text-slate-200
    transition-all duration-200 shadow-lg  
    ${className}
  `}>
    <div className="flex items-center gap-3 mb-1">
      <span className={`${color}`}>{icon}</span>
      <span className="text-3xl  ">
        {value}{unit}
      </span>
    </div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
);

const ActionButton = ({ children, onClick, icon, variant = "primary", className = "", disabled }) => {
  const baseStyles = "flex items-center gap-2 rounded-xl font-medium transition-all duration-200";
  const variants = {
    primary: `bg-emerald-500 text-slate-900 font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'}`,
    secondary: `bg-slate-700 text-slate-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-600'}`
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
};

export default function ProfessionalTypingLab() {
  const [input, setInput] = useState("");
  const [sentence, setSentence] = useState("");
  const [gameState, setGameState] = useState('playing'); // Start directly in playing state
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 30,
    initialTime: 30
  });
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);
  const totalCharsTypedRef = useRef(0);
  const correctCharsRef = useRef(0);
  const hasSubmittedRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
    // No username required - start directly
    setGameState('playing');
  }, []);

  const generateSentence = useCallback(() => {
    if (selectedLesson) {
      return selectedLesson.sentences[currentSentenceIndex];
    }
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    const randomLesson = lessons[values[0] % lessons.length];
    return randomLesson.sentences[0];
  }, [selectedLesson, currentSentenceIndex]);

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false;
    timerStartedRef.current = false;
    startTimeRef.current = null;

    const newSentence = generateSentence();
    setSentence(newSentence);
    setInput("");
    setGameState("playing");
    setStats({
      wpm: 0,
      accuracy: 100,
      time: stats.initialTime,
      initialTime: stats.initialTime
    });

    if (inputRef.current) inputRef.current.focus();
  }, [generateSentence, stats.initialTime]);

  useEffect(() => {
    if (gameState === 'playing' && !sentence) {
      setSentence(generateSentence());
    }
  }, [gameState, generateSentence, sentence]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const endGame = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    
    hasSubmittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    
    audioRef.current?.play();
    
    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    const finalWpm = Math.round((correctCharsRef.current / 5) / (timeElapsed / 60));
    const finalAccuracy = totalCharsTypedRef.current > 0
      ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
      : 100;

    setStats(prev => ({
      ...prev,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      time: 0
    }));

    // NO DATABASE SUBMISSION - Just show results
    setGameState("results");
  }, []);

  const startTimer = useCallback(() => {
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setStats((prev) => {
          const newTime = prev.time - 1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            endGame();
            return { ...prev, time: 0 };
          }
          return { ...prev, time: newTime };
        });
      }, 1000);
    }
  }, [endGame]);

  const processInput = useCallback((newInput) => {
    if (gameState !== "playing" || stats.time <= 0) return;

    if (!timerStartedRef.current && newInput.length > 0) {
      startTimer();
    }

    const addedChars = newInput.length - input.length;
    if (addedChars > 0) {
      totalCharsTypedRef.current += addedChars;
      for (let i = input.length; i < newInput.length; i++) {
        if (newInput[i] === sentence[i]) {
          correctCharsRef.current++;
        }
      }
    } else if (addedChars < 0) {
      for (let i = newInput.length; i < input.length; i++) {
        if (input[i] === sentence[i]) {
          correctCharsRef.current--;
        }
      }
    }

    setInput(newInput);

    const timeElapsed = timerStartedRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 0;

    const netWpm = Math.round(
      timeElapsed > 0 ? (correctCharsRef.current / 5 / (timeElapsed / 60)) : 0
    );

    const accuracy = totalCharsTypedRef.current > 0
      ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
      : 100;

    setStats(prev => ({
      ...prev,
      wpm: netWpm,
      accuracy
    }));

     // CHANGE THIS LINE - End when they reach sentence length
  if (newInput.length >= sentence.length && !hasSubmittedRef.current) {
    endGame();
  }
  }, [sentence, endGame, startTimer, input.length, gameState, stats.time]);

  const handlePhysicalInput = useCallback((e) => {
    if (gameState !== "playing" || stats.time <= 0) return;
    processInput(e.target.value);
  }, [gameState, processInput, stats.time]);

  const handleVirtualInput = useCallback((key) => {
    if (gameState !== "playing" || stats.time <= 0) return;
    const newInput = key === "⌫" ? input.slice(0, -1) : input + key;
    processInput(newInput);
  }, [gameState, processInput, input, stats.time]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleLessonSelect = (lesson) => {
    if (selectedLesson?.id === lesson.id) {
      const nextIndex = (currentSentenceIndex + 1) % lesson.sentences.length;
      setCurrentSentenceIndex(nextIndex);
    } else {
      setSelectedLesson(lesson);
      setCurrentSentenceIndex(0);
    }
    setSidebarOpen(false);
    startGame();
  };

  const progressPercentage = (stats.time / stats.initialTime) * 100;

  const router = useRouter();
  const handleStartNewTest = () => {
    router.push('/');
  };

  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`
        fixed top-17 left-0 h-screen w-72   flex flex-col
        ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} 
        border-r ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 shadow-xl
      `}>
        <div className="flex-shrink-0 p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <BarsArrowUpIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className={`text-xl   ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                Menu
              </h2>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-slate-400 hover:text-slate-200" />
            </button>
          </div>
        </div>
        
        <nav className="flex-shrink-0 p-4 space-y-2 border-b border-slate-700/50">
          <button 
            onClick={() => {
              router.push('/');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-100'} transition-all duration-200 group`}
          >
            <HomeIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={handleStartNewTest}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
              theme === "dark"
                ? "text-slate-300 hover:bg-slate-700/50"
                : "text-slate-700 hover:bg-slate-100"
            } transition-all duration-200 group`}
          >
            <ArrowPathIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span className="font-medium">Take Test</span>
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto p-4 mb-8" style={{ scrollBehavior: 'smooth' }}>
          <h3 className={`text-xs  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider mb-3 px-2`}>
            Training Lessons
          </h3>
          <div className="space-y-2 mb-6">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson)}
                className={`
                  w-full text-left p-4 rounded-xl transition-all duration-200 
                  ${selectedLesson?.id === lesson.id
                    ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : theme === 'dark'
                      ? 'bg-slate-700/30 hover:bg-slate-700/50 border-2 border-transparent hover:border-slate-600'
                      : 'bg-slate-100 hover:bg-slate-200 border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-sm  ${selectedLesson?.id === lesson.id ? 'text-emerald-400' : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {lesson.title}
                  </span>
                  <span className={`
                    text-xs px-2.5 py-1 rounded-full  
                    ${lesson.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                    ${lesson.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : ''}
                    ${lesson.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                  `}>
                    {lesson.difficulty}
                  </span>
                </div>
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} font-medium`}>
                  {selectedLesson?.id === lesson.id 
                    ? ` Exercise ${currentSentenceIndex + 1}/${lesson.sentences.length}` 
                    : ` ${lesson.sentences.length} exercises`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen overflow-x-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
      <Sidebar />
      
      <button
        onClick={() => setSidebarOpen(true)}
        className={`fixed mt-6 left-4 z-30 lg:hidden p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} shadow-lg`}
      >
        <Bars3Icon className="w-7 h-7 text-slate-200 hover:text-emerald-500 transition-colors duration-300 cursor-pointer" />
      </button>

      <div className="lg:ml-64 container mx-auto px-4 py-6 max-w-6xl">
        {gameState === "playing" && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto ml-9">
            {selectedLesson && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/90'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`  ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedLesson.title}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Exercise {currentSentenceIndex + 1} of {selectedLesson.sentences.length}
                    </p>
                  </div>
                  <span className={`
                    text-xs px-3 py-1 rounded-full font-medium
                    ${selectedLesson.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : ''}
                    ${selectedLesson.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${selectedLesson.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {selectedLesson.difficulty}
                  </span>
                </div>
              </div>
            )}

            <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-4">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className={`
              relative text-xl md:text-2xl lg:text-3xl leading-relaxed 
              p-6 md:p-8 lg:p-10 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-white/90'} backdrop-blur-lg rounded-xl 
              transition-all duration-300 border ${theme === 'dark' ? 'border-slate-700/30' : 'border-slate-200/70'}
              shadow-lg ${stats.time <= 0 ? 'opacity-75' : ''}
              ${isMobile ? "h-[40vh] overflow-y-auto mt-14" : "min-h-[35vh]"}
            `}>
              <div className="relative mt-6">
                {sentence.split("").map((char, index) => {
                  const inputChar = input[index];
                  const isActive = index === input.length && stats.time > 0;
                  return (
                    <span
                      key={index}
                      className={`
                        relative 
                        ${isActive ? "text-emerald-500 border-b-2 border-emerald-500" : ""}
                        ${inputChar !== undefined
                          ? inputChar === char
                            ? theme === 'dark' ? "text-slate-300" : "text-slate-700"
                            : "text-rose-500"
                          : theme === 'dark' ? "text-slate-500" : "text-slate-400"
                        }
                        ${isActive ? "animate-pulse" : ""}
                        ${stats.time <= 0 ? 'opacity-50' : ''}
                        transition-colors duration-150
                      `}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handlePhysicalInput}
                className="absolute inset-0 opacity-0 cursor-text"
                disabled={stats.time <= 0}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 ">
              <StatPanel
                value={stats.time}
                label="Time Remaining"
                icon={<ClockIcon className="w-6 h-6" />}
                color="text-emerald-500"
                unit="s" 
              />
              <StatPanel
                value={stats.wpm}
                label="Words Per Minute"
                icon={<BoltIcon className="w-6 h-6" />}
                color="text-emerald-500"
              />
              <StatPanel
                value={stats.accuracy}
                label="Accuracy"
                icon={<ChartBarIcon className="w-6 h-6" />}
                color="text-emerald-500"
                unit="%"
              />
            </div>

            {isMobile && (
              <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-lg border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} p-3 pb-4`}>
                <MobileKeyboard
                  onKeyPress={handleVirtualInput}
                  theme={theme}
                  className="max-w-md mx-auto"
                  disabled={stats.time <= 0}
                />
              </div>
            )}
          </div>
        )}

        {gameState === "results" && (
          <div className="animate-slide-up max-w-4xl mx-auto ">
            <div className={`${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-lg rounded-xl p-8 md:p-10 border ${theme === 'dark' ? 'border-slate-700/30' : 'border-slate-200/70'} shadow-xl`}>
              <div className="text-center mb-10">
                <h2 className={`text-3xl   ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-3`}>
                  Practice Results
                </h2>
                <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Great job on completing the lesson!
                </p>
                {selectedLesson && (
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Lesson: {selectedLesson.title}
                  </p>
                )}
               
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto ">
                <StatPanel
                  value={stats.wpm}
                  label="Words Per Minute"
                  icon={<BoltIcon className="w-7 h-7" />}
                  color="text-emerald-500"
                />
                <StatPanel
                  value={stats.accuracy}
                  label="Accuracy Rate"
                  icon={<ChartBarIcon className="w-7 h-7" />}
                  color="text-emerald-500"
                  unit="%"
                />
              </div>

              <div className="flex justify-center gap-6">
                <ActionButton
                  onClick={startGame}
                  icon={<ArrowPathIcon className="w-5 h-5" />}
                  variant="primary"
                  className="text-lg px-8 py-4"
                >
                  Try Again
                </ActionButton>
                <ActionButton
                  onClick={() => router.push('/')}
                  icon={<ArrowRightCircleIcon  className="w-5 h-5" />}
                  variant="secondary"
                  className="text-lg px-8 py-4"
                >
                  Take Test
                </ActionButton>
              </div>

              {selectedLesson && currentSentenceIndex < selectedLesson.sentences.length - 1 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setCurrentSentenceIndex(currentSentenceIndex + 1);
                      startGame();
                    }}
                    className="text-emerald-400 hover:text-emerald-300 underline "

                  >
                    Next Exercise ⮞
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
