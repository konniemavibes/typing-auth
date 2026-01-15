"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { sentences } from "../constants/sentences";
import { MobileKeyboard } from './MobileKeyboard';
import NavBar from './Navbar';

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

const AuthLoadingModal = ({ isVisible, provider }) => {
  if (!isVisible) return null;

  const getProviderInfo = () => {
    if (provider === 'google') {
      return {
        name: 'Google',
        icon: (
          <svg className="w-12 h-12" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        ),
      };
    }
    return {
      name: 'GitHub',
      icon: (
        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    };
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {providerInfo.icon}
              <div className="absolute inset-0 -m-3">
                <div className="w-20 h-20 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Signing in with {providerInfo.name}
          </h2>
          <p className="text-slate-400 mb-6">
            Please wait while we authenticate you
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfessionalTypingLab() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [sentence, setSentence] = useState("");
  const [gameState, setGameState] = useState('loading');
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 30,
    initialTime: 30
  });
  const [isMobile, setIsMobile] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

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
      
      // Check for authenticated user
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        setUser(JSON.parse(authUser));
      }
    }
  }, []);

  useEffect(() => {
    setGameState('playing');
  }, []);

  const generateSentence = useCallback(() => {
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return sentences[values[0] % sentences.length];
  }, []);

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
    setShowSignInPrompt(false);

    if (inputRef.current) inputRef.current.focus();
  }, [generateSentence, stats.initialTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'results') {
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame]);

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

  const saveScore = useCallback(async (finalWpm, finalAccuracy) => {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          wpm: finalWpm,
          accuracy: finalAccuracy,
          rawWpm: finalWpm,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Score submission failed');
      }
      setSubmitError('');
    } catch (error) {
      setSubmitError(error.message);
    }
  }, [user]);

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

    // Save score if user is authenticated
    await saveScore(finalWpm, finalAccuracy);

    setGameState("results");
  }, [saveScore]);

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

  const handleGoogleSignIn = () => {
    setAuthProvider('google');
    setIsAuthLoading(true);
    
    // Use Stack Auth's hosted sign-in page
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      redirect_url: window.location.origin,
      provider: 'google',
    });
    
    window.location.href = `https://app.stack-auth.com/handler/sign-in?${params.toString()}`;
  };

  const handleGitHubSignIn = () => {
    setAuthProvider('github');
    setIsAuthLoading(true);
    
    // Use Stack Auth's hosted sign-in page
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      redirect_url: window.location.origin,
      provider: 'github',
    });
    
    window.location.href = `https://app.stack-auth.com/handler/sign-in?${params.toString()}`;
  };

  const progressPercentage = (stats.time / stats.initialTime) * 100;

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
      <NavBar />
      <AuthLoadingModal isVisible={isAuthLoading} provider={authProvider} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* User Info Bar */}
        {user && (
          <div className="flex justify-end items-center gap-4 mb-6">
            <div className="flex items-center gap-3 bg-slate-800/90 px-4 py-2 rounded-lg">
              {user.image && (
                <img 
                  src={user.image} 
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-slate-200">{user.name || user.email}</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('authUser');
                setUser(null);
              }}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}

        {/* Sign In Prompt for Non-Authenticated Users */}
        {!user && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <UserPlusIcon className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="text-slate-200 font-medium">Sign in to save your scores</p>
                  <p className="text-slate-400 text-sm">Your results won't be saved to the leaderboard without signing in</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign in with Google
                </button>
                <button
                  onClick={handleGitHubSignIn}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Sign in with GitHub
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-all"
                title="Restart (Ctrl+Space)"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Restart
                <span className="ml-1 px-2 py-0.5 bg-slate-600 rounded text-xs">Ctrl+Space</span>
              </button>
            </div>

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
                        ${stats.time <= 0 ? 'opacity-75' : ''}
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

            <div className="grid grid-cols-3 gap-4 mt-8">
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
          <div className="animate-slide-up max-w-4xl mx-auto">
            <div className={`${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-lg rounded-xl p-8 md:p-10 border ${theme === 'dark' ? 'border-slate-700/30' : 'border-slate-200/70'} shadow-xl`}>
              <div className="text-center mb-10">
                <h2 className={`text-3xl ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-3`}>
                  {user ? user.name : 'Your'} Results
                </h2>
                <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {user ? 'Score saved to leaderboard!' : 'Great job! Sign in to save your score.'}
                </p>
              </div>

              {/* Sign In Prompt in Results */}
              {showSignInPrompt && !user && (
                <div className="mb-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                  <div className="text-center">
                    <UserPlusIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">
                      Want to save this score?
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Sign in to compete on the leaderboard and track your progress!
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleGoogleSignIn}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                      </button>
                      <button
                        onClick={handleGitHubSignIn}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Sign in with GitHub
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
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

              {submitError && (
                <div className="mb-6 p-4 bg-rose-900/20 border border-rose-500/30 rounded-lg">
                  <p className="text-rose-400 text-center">{submitError}</p>
                </div>
              )}

              <div className="flex justify-center gap-6">
                <ActionButton
                  onClick={startGame}
                  icon={<ArrowPathIcon className="w-5 h-5" />}
                  variant="primary"
                  className="text-lg px-8 py-4"
                >
                  Try Again
                  <span className="ml-2 px-2 py-0.5 bg-emerald-600 rounded text-xs">Ctrl+Space</span>
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}