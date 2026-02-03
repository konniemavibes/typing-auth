"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BarsArrowUpIcon,
  ArrowRightCircleIcon,
  LockClosedIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { MobileKeyboard } from '../components/MobileKeyboard';
import NavBar from '../components/Navbar';

// Animation themes for typing area
const animationThemes = {
  wave: {
    name: "🌊 Wave",
    className: "animate-wave",
    description: "Flowing wave motion"
  },
  pulse: {
    name: "💓 Pulse",
    className: "animate-pulse-theme",
    description: "Gentle pulsing rhythm"
  },
  fade: {
    name: "✨ Fade",
    className: "animate-fade",
    description: "Subtle fading effect"
  }
};

// Progressive typing levels with sub-lessons and exercises
const typingLevels = [
  {
    id: 1,
    title: "Beginner",
    description: "Master the fundamentals of touch typing",
    color: "emerald",
    icon: "🌱",
    subLessons: [
      {
        id: 1,
        title: "A & S Keys",
        description: "Learn the A and S keys - your first steps",
        targetAccuracy: 90,
        exercises: [
          { text: "a a a a a a a a a a", instruction: "Press A repeatedly" },
          { text: "s s s s s s s s s s", instruction: "Press S repeatedly" },
          { text: "a s a s a s a s a s", instruction: "Alternate A and S" },
          { text: "as as as as as as as", instruction: "Type 'as' together" }
        ]
      },
      {
        id: 2,
        title: "D & F Keys",
        description: "Add D and F to your typing foundation",
        targetAccuracy: 90,
        exercises: [
          { text: "d d d d d d d d d d", instruction: "Press D repeatedly" },
          { text: "f f f f f f f f f f", instruction: "Press F repeatedly" },
          { text: "a d a d a d a d a d", instruction: "Alternate A and D" },
          { text: "s f s f s f s f s f", instruction: "Alternate S and F" },
          { text: "ad sf ad sf ad sf ad", instruction: "Type 'ad sf' pattern" }
        ]
      },
      {
        id: 3,
        title: "J & K Keys",
        description: "Learn the J and K keys for right hand",
        targetAccuracy: 90,
        exercises: [
          { text: "j j j j j j j j j j", instruction: "Press J repeatedly" },
          { text: "k k k k k k k k k k", instruction: "Press K repeatedly" },
          { text: "j k j k j k j k j k", instruction: "Alternate J and K" },
          { text: "fj dk fj dk fj dk fj", instruction: "Type 'fj dk' pattern" }
        ]
      },
      {
        id: 4,
        title: "Home Row Mastery",
        description: "Complete the home row with L and ;",
        targetAccuracy: 90,
        exercises: [
          { text: "l l l l l l l l l l", instruction: "Press L repeatedly" },
          { text: "; ; ; ; ; ; ; ; ; ;", instruction: "Press ; repeatedly" },
          { text: "j l j l j l j l j l", instruction: "Alternate J and L" },
          { text: "k ; k ; k ; k ; k ;", instruction: "Alternate K and ;" },
          { text: "asdf jkl; asdf jkl;", instruction: "Type full home row" }
        ]
      },
      {
        id: 5,
        title: "Home Row Practice",
        description: "Master the complete home row",
        targetAccuracy: 95,
        exercises: [
          { text: "asdf jkl; asdf jkl; asdf jkl;", instruction: "Practice home row" },
          { text: "a s d f j k l ; a s d f j k l ;", instruction: "Type all home row keys" },
          { text: "the quick brown fox jumps over the lazy dog", instruction: "Classic pangram" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Intermediate",
    description: "Expand your typing skills beyond the home row",
    color: "blue",
    icon: "🚀",
    subLessons: [
      {
        id: 6,
        title: "E & I Keys",
        description: "Add E and I to your typing vocabulary",
        targetAccuracy: 90,
        exercises: [
          { text: "e e e e e e e e e e", instruction: "Press E repeatedly" },
          { text: "i i i i i i i i i i", instruction: "Press I repeatedly" },
          { text: "d e d e d e d e d e", instruction: "Alternate D and E" },
          { text: "f i f i f i f i f i", instruction: "Alternate F and I" },
          { text: "the quick brown fox", instruction: "Practice with words" }
        ]
      },
      {
        id: 7,
        title: "R & U Keys",
        description: "Learn R and U keys for better reach",
        targetAccuracy: 90,
        exercises: [
          { text: "r r r r r r r r r r", instruction: "Press R repeatedly" },
          { text: "u u u u u u u u u u", instruction: "Press U repeatedly" },
          { text: "e r e r e r e r e r", instruction: "Alternate E and R" },
          { text: "i u i u i u i u i u", instruction: "Alternate I and U" },
          { text: "red rum runs under", instruction: "Practice with sentences" }
        ]
      },
      {
        id: 8,
        title: "T & Y Keys",
        description: "Complete the top row with T and Y",
        targetAccuracy: 90,
        exercises: [
          { text: "t t t t t t t t t t", instruction: "Press T repeatedly" },
          { text: "y y y y y y y y y y", instruction: "Press Y repeatedly" },
          { text: "r t r t r t r t r t", instruction: "Alternate R and T" },
          { text: "u y u y u y u y u y", instruction: "Alternate U and Y" },
          { text: "qwerty uiop qwerty uiop", instruction: "Type full top row" }
        ]
      },
      {
        id: 9,
        title: "Top Row Practice",
        description: "Master all top row combinations",
        targetAccuracy: 92,
        exercises: [
          { text: "qwertyuiop qwertyuiop", instruction: "Type the top row" },
          { text: "the quick brown fox jumps", instruction: "Practice with phrases" },
          { text: "typewriter quality test", instruction: "Advanced top row practice" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Advanced",
    description: "Achieve typing mastery with complex patterns",
    color: "purple",
    icon: "⭐",
    subLessons: [
      {
        id: 10,
        title: "Number Row",
        description: "Master the number row and symbols",
        targetAccuracy: 95,
        exercises: [
          { text: "1234567890 1234567890", instruction: "Type numbers 1-0" },
          { text: "!@#$%^&*() !@#$%^&*()", instruction: "Type symbols" },
          { text: "the price is $123.45", instruction: "Numbers in context" }
        ]
      },
      {
        id: 11,
        title: "Full Keyboard",
        description: "Combine all skills for complete mastery",
        targetAccuracy: 95,
        exercises: [
          { text: "the quick brown fox jumps over the lazy dog", instruction: "Classic pangram" },
          { text: "sphinx of black quartz judge my vow", instruction: "Advanced pangram" },
          { text: "pack my box with five dozen liquor jugs", instruction: "Complex sentence" }
        ]
      },
      {
        id: 12,
        title: "Speed Building",
        description: "Push your limits with longer texts",
        targetAccuracy: 90,
        exercises: [
          { text: "programming is the art of telling another human what one wants the computer to do", instruction: "Technical text" },
          { text: "the only way to do great work is to love what you do if you havent found it yet keep looking", instruction: "Motivational text" },
          { text: "success is not final failure is not fatal it is the courage to continue that counts", instruction: "Inspirational text" }
        ]
      }
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
      <span className="text-3xl">
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

// Sign In Required Component
const SignInRequired = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Small delay to ensure session is created
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <LockClosedIcon className="w-16 h-16 text-emerald-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Sign In Required
          </h2>
          
          <p className="text-slate-400 text-sm">
            Sign in to access typing lessons and track your progress!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium text-slate-900 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <ArrowRightCircleIcon className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function ProfessionalTypingLab() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [sentence, setSentence] = useState("");
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'results'
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 30,
    initialTime: 30,
    backspaceErrors: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [selectedAnimation, setSelectedAnimation] = useState('simple');
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState(new Set([1])); // Beginner level starts expanded

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);
  const totalCharsTypedRef = useRef(0);
  const correctCharsRef = useRef(0);
  const hasSubmittedRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
    }
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('typing-lessons-progress');
      if (savedProgress) {
        setCompletedLessons(new Set(JSON.parse(savedProgress)));
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typing-lessons-progress', JSON.stringify([...completedLessons]));
    }
  }, [completedLessons]);

  const handleLessonSelect = (lesson) => {
    if (lesson.id > 1 && !completedLessons.has(lesson.id - 1)) {
      return; // Don't allow selecting locked lessons
    }

    setSelectedLesson(lesson);
    setCurrentExerciseIndex(0);
    setShowModal(true);
    setGameState('playing');
    startExercise(lesson, 0);
  };

  const startExercise = (lesson, exerciseIndex) => {
    const exercise = lesson.exercises[exerciseIndex];
    setSentence(exercise.text);
    setInput("");
    setStats({
      wpm: 0,
      accuracy: 100,
      time: 30,
      initialTime: 30
    });

    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false;
    timerStartedRef.current = false;
    startTimeRef.current = null;

    if (inputRef.current) inputRef.current.focus();
  };

  const checkLessonCompletion = (lesson, finalAccuracy) => {
    return finalAccuracy >= lesson.targetAccuracy;
  };

  const nextExercise = () => {
    if (!selectedLesson) return;

    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < selectedLesson.exercises.length) {
      setCurrentExerciseIndex(nextIndex);
      startExercise(selectedLesson, nextIndex);
    } else {
      // Lesson completed
      setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
      setGameState('lesson-complete');
    }
  };

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false;
    timerStartedRef.current = false;
    startTimeRef.current = null;

    setInput("");
    setGameState("playing");
    setStats({
      wpm: 0,
      accuracy: 100,
      time: stats.initialTime,
      initialTime: stats.initialTime
    });

    if (inputRef.current) inputRef.current.focus();
  }, [stats.initialTime]);



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

    // Check if lesson is completed (all exercises done)
    if (selectedLesson && currentExerciseIndex >= selectedLesson.exercises.length - 1) {
      setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
    }

    setGameState("results");
  }, [selectedLesson]);

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
    if (gameState !== "playing") return;

    if (!timerStartedRef.current && newInput.length > 0) {
      startTimer();
    }

    const addedChars = newInput.length - input.length;
    let backspaceErrors = stats.backspaceErrors;

    if (addedChars > 0) {
      totalCharsTypedRef.current += addedChars;
      for (let i = input.length; i < newInput.length; i++) {
        if (newInput[i] === sentence[i]) {
          correctCharsRef.current++;
        }
      }
    } else if (addedChars < 0) {
      // Track backspace errors - if user backspaces a correct character
      for (let i = newInput.length; i < input.length; i++) {
        if (input[i] === sentence[i]) {
          correctCharsRef.current--;
          backspaceErrors++;
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
      accuracy,
      backspaceErrors
    }));

    if (newInput.length >= sentence.length && !hasSubmittedRef.current) {
      endGame();
    }
  }, [sentence, endGame, startTimer, input.length, gameState, stats.backspaceErrors]);

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



  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show sign-in page if not authenticated
  if (!session) {
    return <SignInRequired />;
  }

  const progressPercentage = (stats.time / stats.initialTime) * 100;
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
        fixed top-17 left-0 h-screen w-72 flex flex-col
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
              <div>
                <h2 className={`text-xl ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  Menu
                </h2>
                <p className="text-xs text-slate-400">
                  {session.user.name}
                </p>
              </div>
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
            onClick={() => router.push('/')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-100'} transition-all duration-200 group`}
          >
            <HomeIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span className="font-medium">Home</span>
          </button>
          <button
            onClick={handleStartNewTest}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${theme === "dark" ? "text-slate-300 hover:bg-slate-700/50" : "text-slate-700 hover:bg-slate-100"} transition-all duration-200 group`}
          >
            <ArrowPathIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span className="font-medium">Take Test</span>
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto p-4 mb-8" style={{ scrollBehavior: 'smooth' }}>
          <h3 className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider mb-3 px-2`}>
            Typing Mastery Journey
          </h3>
          <div className="space-y-2">
            {typingLevels.map((level) => {
              const isLevelLocked = level.id > 1 && !completedLessons.has((level.id - 1) * 5); // Unlock level when previous level's last lesson is completed
              const isExpanded = expandedLevels.has(level.id);
              const completedInLevel = level.subLessons.filter(lesson => completedLessons.has(lesson.id)).length;
              const totalInLevel = level.subLessons.length;

              return (
                <div key={level.id} className="space-y-1">
                  {/* Level Header */}
                  <div
                    className={`
                      relative p-4 rounded-xl transition-all duration-200 cursor-pointer
                      ${isLevelLocked
                        ? `${theme === 'dark' ? 'bg-slate-800/30 border-slate-600/30' : 'bg-gray-100/30 border-gray-300/30'} opacity-60`
                        : `${theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700/70 border-slate-600/50' : 'bg-slate-100 hover:bg-slate-200 border-gray-200'}`
                      }
                      border
                    `}
                    onClick={() => !isLevelLocked && setExpandedLevels(prev =>
                      prev.has(level.id)
                        ? new Set([...prev].filter(id => id !== level.id))
                        : new Set([...prev, level.id])
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{level.icon}</span>
                        <div>
                          <h4 className={`font-semibold ${isLevelLocked ? 'text-slate-500' : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                            {level.title}
                          </h4>
                          <p className={`text-xs ${isLevelLocked ? 'text-slate-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {level.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          level.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          level.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {completedInLevel}/{totalInLevel}
                        </span>

                        {isLevelLocked && (
                          <LockClosedIcon className="w-5 h-5 text-slate-500" />
                        )}

                        {!isLevelLocked && (
                          <svg
                            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${
                              level.color === 'emerald' ? 'text-emerald-500' :
                              level.color === 'blue' ? 'text-blue-500' : 'text-purple-500'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {isLevelLocked && (
                      <div className="mt-2 text-xs text-slate-500">
                        Complete Beginner level to unlock
                      </div>
                    )}
                  </div>

                  {/* Sub-lessons */}
                  {isExpanded && !isLevelLocked && (
                    <div className="ml-6 space-y-2">
                      {level.subLessons.map((lesson) => {
                        const isLessonLocked = lesson.id > 1 && !completedLessons.has(lesson.id - 1);
                        const isCompleted = completedLessons.has(lesson.id);
                        const isSelected = selectedLesson?.id === lesson.id;

                        return (
                          <div
                            key={lesson.id}
                            className={`
                              relative p-3 rounded-lg transition-all duration-200 border-l-4
                              ${isSelected
                                ? `bg-${level.color}-500/10 border-${level.color}-500 shadow-lg`
                                : isLessonLocked
                                  ? `${theme === 'dark' ? 'bg-slate-800/30 border-slate-600' : 'bg-gray-100/30 border-gray-300'} opacity-60 cursor-not-allowed`
                                  : `${theme === 'dark' ? 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600' : 'bg-slate-50 hover:bg-slate-100 border-gray-200'} cursor-pointer`
                              }
                            `}
                            onClick={() => !isLessonLocked && handleLessonSelect(lesson)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-medium ${
                                    isSelected ? `text-${level.color}-400` :
                                    isLessonLocked ? 'text-slate-500' :
                                    theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                                  }`}>
                                    {lesson.title}
                                  </span>

                                  {isCompleted && (
                                    <div className={`w-4 h-4 bg-${level.color}-500 rounded-full flex items-center justify-center`}>
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}

                                  {isLessonLocked && (
                                    <LockClosedIcon className="w-4 h-4 text-slate-500" />
                                  )}
                                </div>

                                <p className={`text-xs ${isLessonLocked ? 'text-slate-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {lesson.description}
                                </p>

                                {isSelected && (
                                  <p className={`text-xs mt-1 text-${level.color}-400 font-medium`}>
                                    Exercise {currentExerciseIndex + 1}/{lesson.exercises.length}
                                  </p>
                                )}

                                {isLessonLocked && (
                                  <p className="text-xs mt-1 text-slate-500">
                                    Complete previous lesson to unlock
                                  </p>
                                )}
                              </div>

                              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                lesson.targetAccuracy >= 95 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                lesson.targetAccuracy >= 92 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                'bg-green-500/20 text-green-400 border border-green-500/30'
                              }`}>
                                {lesson.targetAccuracy}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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
        {/* Welcome Message */}
        {gameState === 'menu' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-4`}>
                Welcome to Typing Mastery
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                Your journey to becoming a typing expert starts here
              </p>
              <p className={`text-lg ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                Use the sidebar to explore lessons and track your progress
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} mb-2`}>
                    {completedLessons.size}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Lessons Completed
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                    {Math.max(0, 12 - completedLessons.size)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Lessons Remaining
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
                    {completedLessons.size > 0 ? Math.round((completedLessons.size / 12) * 100) : 0}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Progress
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10' : 'bg-gradient-to-r from-emerald-50 to-blue-50'} border ${theme === 'dark' ? 'border-emerald-500/20' : 'border-emerald-200'}`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-4`}>
                  🚀 Ready to Start Your Typing Journey?
                </h3>
                <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-6`}>
                  Begin with the fundamentals and work your way up to advanced techniques.
                  Each lesson builds on the previous one, ensuring steady progress and mastery.
                </p>
                <div className="flex justify-center">
                  <div className={`px-6 py-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      💡 Tip: Start with the Beginner level in the sidebar and complete lessons sequentially
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typing Exercise Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`relative w-full max-w-4xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-h-[90vh] overflow-hidden`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div>
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {selectedLesson?.title}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Exercise {currentExerciseIndex + 1} of {selectedLesson?.exercises.length}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setGameState('menu');
                  }}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {gameState === 'playing' && (
                  <div className="space-y-6">
                    {/* Exercise Instruction */}
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                        {selectedLesson?.exercises[currentExerciseIndex]?.instruction}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${(input.length / sentence.length) * 100}%` }}
                      />
                    </div>

                    {/* Typing Area */}
                    <div className={`
                      relative text-2xl md:text-3xl leading-relaxed
                      p-6 md:p-8 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-gray-50'} backdrop-blur-lg rounded-xl
                      border ${theme === 'dark' ? 'border-slate-700/30' : 'border-gray-200'}
                      shadow-lg min-h-[200px] flex items-center justify-center
                    `}>
                      <div className="text-center">
                        {sentence.split("").map((char, index) => {
                          const inputChar = input[index];
                          const isActive = index === input.length && stats.time > 0;
                          return (
                            <span
                              key={index}
                              className={`
                                relative text-4xl mx-1
                                ${isActive ? "text-emerald-500 border-b-2 border-emerald-500" : ""}
                                ${inputChar !== undefined
                                  ? inputChar === char
                                    ? theme === 'dark' ? "text-slate-300" : "text-slate-700"
                                    : "text-rose-500"
                                  : theme === 'dark' ? "text-slate-500" : "text-slate-400"
                                }
                                ${isActive ? "animate-pulse" : ""}
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

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
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

                    {/* Show timer when there are backspace errors */}
                    {stats.backspaceErrors > 0 && (
                      <div className="flex justify-center">
                        <StatPanel
                          value={stats.time}
                          label="Time Remaining"
                          icon={<ClockIcon className="w-6 h-6" />}
                          color="text-rose-500"
                          unit="s"
                          className="bg-rose-500/10 border-rose-500/30"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Exercise Results */}
                {gameState === 'results' && (
                  <div className="text-center space-y-6">
                    <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex justify-center mb-4">
                        {stats.accuracy >= selectedLesson?.targetAccuracy ? (
                          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                            <ArrowPathIcon className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-2`}>
                        {stats.accuracy >= selectedLesson?.targetAccuracy ? 'Exercise Completed!' : 'Try Again'}
                      </h3>

                      <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
                        {stats.accuracy >= selectedLesson?.targetAccuracy
                          ? `Great job! You achieved ${stats.accuracy}% accuracy.`
                          : `You need ${selectedLesson?.targetAccuracy}% accuracy. You got ${stats.accuracy}%.`
                        }
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6 max-w-xs mx-auto">
                        <StatPanel
                          value={stats.wpm}
                          label="WPM"
                          icon={<BoltIcon className="w-5 h-5" />}
                          color="text-emerald-500"
                        />
                        <StatPanel
                          value={stats.accuracy}
                          label="Accuracy"
                          icon={<ChartBarIcon className="w-5 h-5" />}
                          color="text-emerald-500"
                          unit="%"
                        />
                      </div>

                      <div className="flex gap-4 justify-center">
                        {stats.accuracy >= selectedLesson?.targetAccuracy ? (
                          <ActionButton
                            onClick={nextExercise}
                            icon={<ArrowRightCircleIcon className="w-5 h-5" />}
                            variant="primary"
                          >
                            Next Exercise
                          </ActionButton>
                        ) : (
                          <ActionButton
                            onClick={() => startExercise(selectedLesson, currentExerciseIndex)}
                            icon={<ArrowPathIcon className="w-5 h-5" />}
                            variant="primary"
                          >
                            Try Again
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Complete */}
                {gameState === 'lesson-complete' && (
                  <div className="text-center space-y-6">
                    <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-2`}>
                        Lesson Completed! 🎉
                      </h3>

                      <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
                        Congratulations! You've mastered "{selectedLesson?.title}".
                        {selectedLesson?.id < 12 && " The next lesson is now unlocked!"}
                      </p>

                      <div className="flex gap-4 justify-center">
                        <ActionButton
                          onClick={() => {
                            setShowModal(false);
                            setGameState('menu');
                          }}
                          icon={<HomeIcon className="w-5 h-5" />}
                          variant="primary"
                        >
                          Back to Lessons
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}