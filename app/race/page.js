'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  PlayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import NavBar from '../components/Navbar';
import RaceResultsModal from '../components/RaceResultsModal';
import { sentences } from '../constants/sentences';

export default function RacePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState('home'); // home, create, join, racing
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [race, setRace] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentSentence, setCurrentSentence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [raceStarted, setRaceStarted] = useState(false);
  const [countDown, setCountDown] = useState(null);
  const [practiceCountDown, setPracticeCountDown] = useState(null);
  const [results, setResults] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [error, setError] = useState('');
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const inputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  // Polling for race updates
  const pollRaceUpdates = async () => {
    if (!roomCode) return;

    try {
      const res = await fetch(`/api/race?roomCode=${roomCode}`);
      const data = await res.json();
      
      if (res.ok) {
        // Log participants progress for debugging
        if (raceStarted && data.participants) {
          console.log('Participants progress:', data.participants.map(p => ({
            username: p.user.username,
            progress: p.progress,
            wpm: p.wpm,
            rawWpm: p.rawWpm
          })));
        }
        
        // Only update participants to avoid triggering full re-renders
        // Don't update race object during active race to prevent state resets
        if (!raceStarted) {
          setRace(data);
        }
        
        // Always update participants for live leaderboard
        setParticipants(data.participants || []);
        
        // If race is active and has a startTime, calculate countdown
        if (data.status === 'active' && data.startTime && !raceStarted) {
          // Calculate remaining countdown based on server's startTime
          const elapsedSeconds = Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000);
          const remainingCountdown = Math.max(0, 10 - elapsedSeconds);
          
          if (remainingCountdown > 0) {
            setCountDown(remainingCountdown);
          } else {
            // Countdown finished, start the race
            const startTime = Date.now();
            setRaceStartTime(startTime);
            setRaceStarted(true);
            setUserInput('');
            setFinished(false);
            setCountDown(null);
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  };

  useEffect(() => {
    if (!roomCode || mode !== 'racing') return;

    // Poll for updates - frequency depends on race state
    // Before race starts: 500ms for countdown sync
    // During race: 200ms for live participant updates
    // After race: 500ms for results
    const pollInterval = raceStarted ? 200 : 500;
    pollIntervalRef.current = setInterval(pollRaceUpdates, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [roomCode, mode, raceStarted]);

  const handleCreateRoom = async () => {
    try {
      setError('');
      const res = await fetch('/api/race', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to create room');
        return;
      }

      setRoomCode(data.roomCode);
      setRace(data);
      setParticipants(data.participants);
      setCurrentUserId(data.creatorId);
      setCurrentSentence(sentences[data.sentenceId]);
      setMode('racing');
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    try {
      setError('');
      if (!inputCode.trim()) {
        setError('Please enter a room code');
        return;
      }

      const res = await fetch('/api/race/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: inputCode.toUpperCase() })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to join room');
        return;
      }

      setRoomCode(data.roomCode);
      setRace(data);
      setParticipants(data.participants);
      // Find current user in participants
      const myParticipant = data.participants?.find(p => p.user?.username === session.user.name);
      if (myParticipant) {
        setCurrentUserId(myParticipant.userId);
      }
      setCurrentSentence(sentences[data.sentenceId]);
      setMode('racing');
    } catch (err) {
      setError('Failed to join room');
    }
  };

  const handleStartRace = async () => {
    try {
      setError('');
      
      // Check if at least 2 participants
      if (participants.length < 2) {
        setError('At least 2 participants are required to start the race');
        return;
      }

      console.log('Starting race with roomCode:', roomCode, 'Participants:', participants.length);
      
      const res = await fetch(`/api/race/${roomCode}/start`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      console.log('Start response:', { status: res.status, data });
      
      if (!res.ok) {
        const errorMsg = data.error || `Failed to start race: ${res.status}`;
        console.error('Start race failed:', errorMsg, data.details);
        setError(errorMsg);
        return;
      }

      console.log('Race started successfully, data:', data);
      setRace(data);
      
      // Start 10-second practice countdown
      let practiceCount = 10;
      while (practiceCount > 0) {
        setPracticeCountDown(practiceCount);
        await new Promise(resolve => setTimeout(resolve, 1000));
        practiceCount--;
      }
      setPracticeCountDown(null);

      const startTime = Date.now();
      setRaceStartTime(startTime);
      setRaceStarted(true);
      setUserInput('');
      setFinished(false);
      setError('');
      
      // Start 10-second race countdown using server countdown
      let count = 10;
      while (count > 0) {
        setCountDown(count);
        await new Promise(resolve => setTimeout(resolve, 1000));
        count--;
      }
      setCountDown(null);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Start race error:', err);
      setError('Failed to start race: ' + err.message);
    }
  };

  const calculateWPM = (chars, timeMs) => {
    const minutes = timeMs / 60000;
    return Math.round((chars / 5) / minutes) || 0;
  };

  const calculateRawWPM = (chars, timeMs) => {
    const minutes = timeMs / 60000;
    return Math.round(chars / 5 / minutes) || 0;
  };

  const calculateAccuracy = (typed, sentence) => {
    const sentenceChars = sentence.split('');
    const correctChars = typed.filter((char, idx) => char === sentenceChars[idx]).length;
    return typed.length > 0 ? (correctChars / typed.length) * 100 : 100;
  };

  const handleTyping = async (e) => {
    const value = e.target.value;
    setUserInput(value);

    if (raceStarted && raceStartTime) {
      const progress = value.length;
      const typed = value.split('');
      const sentenceChars = currentSentence.split('');
      const correctChars = typed.filter((char, idx) => char === sentenceChars[idx]).length;
      const accuracy = typed.length > 0 ? (correctChars / typed.length) * 100 : 100;
      const elapsed = Date.now() - raceStartTime;
      const wpm = calculateWPM(progress, elapsed);
      const rawWpm = calculateRawWPM(progress, elapsed);

      // Update progress - send immediately
      fetch(`/api/race/${roomCode}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress, accuracy: Math.round(accuracy), wpm, rawWpm })
      }).catch(err => console.error('Progress update failed:', err));

      // Check if finished
      if (value === currentSentence && !finished) {
        setFinished(true);
        try {
          const res = await fetch(`/api/race/${roomCode}/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wpm, accuracy: Math.round(accuracy), rawWpm })
          });

          if (res.ok) {
            const data = await res.json();
            // Show results modal after 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
            setResults(data.results || []);
            setShowResultsModal(true);
          }
        } catch (err) {
          console.error('Failed to finish race:', err);
        }
      }
    }
  };

  const handleBackHome = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setMode('home');
    setRoomCode('');
    setInputCode('');
    setUserInput('');
    setError('');
    setParticipants([]);
    setRaceStarted(false);
    setFinished(false);
    setCurrentUserId(null);
    setResults([]);
    setCountDown(null);
    setPracticeCountDown(null);
    setCurrentSentence('');
    setRaceStartTime(null);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Home Screen */}
        {mode === 'home' && (
          <div className="text-center py-12">
            <h1 className="text-5xl font-bold text-slate-100 mb-4">
              Race Mode
            </h1>
            <p className="text-slate-400 mb-12 text-lg">
              Challenge your friends in real-time typing races
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={handleCreateRoom}
                className="p-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 transition-all group"
              >
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-xl font-bold text-emerald-400 mb-2">
                  Create Room
                </h2>
                <p className="text-slate-400 text-sm">
                  Start a new race and invite friends
                </p>
              </button>

              <button
                onClick={() => setMode('join')}
                className="p-8 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500 transition-all group"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h2 className="text-xl font-bold text-blue-400 mb-2">
                  Join Room
                </h2>
                <p className="text-slate-400 text-sm">
                  Join an existing race with a room code
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Join Screen */}
        {mode === 'join' && (
          <div className="max-w-md mx-auto py-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-6">
              Enter Room Code
            </h2>

            <div className="bg-slate-800/90 rounded-xl p-8 border border-slate-700">
              <input
                type="text"
                placeholder="Enter room code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-4"
              />

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleJoinRoom}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-lg transition-all mb-3"
              >
                Join Race
              </button>

              <button
                onClick={() => setMode('home')}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold rounded-lg transition-all"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Racing Screen */}
        {mode === 'racing' && (
          <div className="py-8">
            {/* Room Code & Participants */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-slate-400 text-sm">Room Code</p>
                  <p className="text-3xl font-bold text-emerald-400">{roomCode}</p>
                </div>
                <button
                  onClick={handleBackHome}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Participants List */}
              <div className="bg-slate-800/90 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <UsersIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-slate-200 font-bold">Participants ({participants.length})</h3>
                </div>

                <div className="grid gap-4">
                  {participants.map((p) => (
                    <div
                      key={p.userId}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {p.user.image && (
                          <img
                            src={p.user.image}
                            alt={p.user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-medium text-slate-200">
                          {p.user.username}
                        </span>
                      </div>
                      {raceStarted && (
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold">
                            {p.wpm.toFixed(0)} WPM
                          </div>
                          <div className="text-sm text-slate-400">
                            {p.accuracy}% • {p.progress}/{currentSentence.length}
                          </div>
                        </div>
                      )}
                      {p.finished && <CheckCircleIcon className="w-5 h-5 text-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Race Area */}
            {!raceStarted && (
              <div className="py-12">
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Show sentence to all participants */}
                {currentSentence && (
                  <div className="mb-8">
                    <p className="text-slate-400 text-center text-lg mb-4">
                      Practice typing this sentence:
                    </p>
                    <div className="bg-slate-800/90 p-6 rounded-lg border border-slate-700 max-w-4xl mx-auto mb-6">
                      <p className="text-xl font-mono text-slate-300 leading-relaxed text-center">
                        {currentSentence.split('').map((char, idx) => {
                          let color = 'text-slate-400';
                          if (idx < userInput.length) {
                            color =
                              userInput[idx] === char
                                ? 'text-emerald-400'
                                : 'text-red-400';
                          }
                          return (
                            <span
                              key={idx}
                              className={`${color} ${
                                idx === userInput.length
                                  ? 'bg-emerald-500/30'
                                  : ''
                              }`}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </p>
                    </div>

                    {/* Practice typing input */}
                    <div className="max-w-2xl mx-auto">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Practice typing here..."
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <p className="text-slate-400 text-sm text-center mt-2">
                        Practice typing the sentence above. Your input will be cleared when the race starts.
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {practiceCountDown > 0 ? (
                    <div className="text-center">
                      <p className="text-slate-400 mb-4">Practice Phase - Get Ready!</p>
                      <div className="text-6xl font-bold text-blue-400 mb-4 animate-pulse">
                        {practiceCountDown}
                      </div>
                    </div>
                  ) : countDown > 0 ? (
                    <div className="text-center">
                      <p className="text-slate-400 mb-4">Race Starting!</p>
                      <div className="text-6xl font-bold text-emerald-400 mb-4 animate-pulse">
                        {countDown}
                      </div>
                    </div>
                  ) : race?.countdown && race.countdown > 0 ? (
                    <div className="text-6xl font-bold text-emerald-400 mb-4 animate-pulse">
                      {race.countdown}
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-400 mb-6">
                        {participants.length < 2 
                          ? `Waiting for participants... (${participants.length}/2)`
                          : 'Ready to type? Click start when everyone is ready!'
                        }
                      </p>
                      {currentUserId === race?.creatorId && (
                        <button
                          onClick={handleStartRace}
                          disabled={participants.length < 2}
                          className={`px-8 py-3 ${
                            participants.length < 2
                              ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900'
                          } font-bold rounded-lg flex items-center gap-2 mx-auto transition-all`}
                        >
                          <PlayIcon className="w-5 h-5" />
                          Start Race {participants.length < 2 ? `(${participants.length}/2)` : ''}
                        </button>
                      )}
                      {currentUserId !== race?.creatorId && (
                        <p className="text-slate-400 text-sm">
                          {participants.length < 2 
                            ? `Waiting for more participants... (${participants.length}/2)`
                            : 'Waiting for race creator to start...'
                          }
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Typing Area with Live Race */}
            {raceStarted && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Typing Area */}
                <div className="lg:col-span-3">
                  <div className="bg-slate-800/90 rounded-xl p-8 border border-slate-700">
                    <div className="mb-6">
                      <p className="text-slate-400 text-center text-lg mb-4">
                        Type this sentence:
                      </p>
                      <div className="bg-slate-900 p-8 rounded-lg mb-6 relative min-h-[120px] flex items-center justify-center">
                        {!currentSentence ? (
                          <p className="text-slate-400">Loading sentence...</p>
                        ) : (
                          <div className="text-2xl font-mono text-slate-300 leading-relaxed relative inline-block">
                            {currentSentence.split('').map((char, idx) => {
                              let color = 'text-slate-400';
                              if (idx < userInput.length) {
                                color =
                                  userInput[idx] === char
                                    ? 'text-emerald-400'
                                    : 'text-red-400';
                              }
                              
                              // Get all participants at this position
                              const participantsAtPosition = participants
                                .filter(p => p.progress === idx && p.userId !== currentUserId)
                                .sort((a, b) => (b.wpm || 0) - (a.wpm || 0));
                              
                              return (
                                <span key={idx} className="relative inline-block">
                                  <span
                                    className={`${color} ${
                                      idx === userInput.length
                                        ? 'bg-emerald-500/30 border-b-2 border-emerald-400'
                                        : ''
                                    }`}
                                  >
                                    {char}
                                  </span>
                                  
                                  {/* Show inline cursors for other participants */}
                                  {participantsAtPosition.length > 0 && (
                                    <div className="absolute -top-8 left-0 flex gap-1">
                                      {participantsAtPosition.map((p, pidx) => (
                                        <div
                                          key={p.userId}
                                          className="relative flex flex-col items-center"
                                        >
                                          {p.user?.image ? (
                                            <img
                                              src={p.user.image}
                                              alt={p.user.username}
                                              className="w-6 h-6 rounded-full border border-blue-400 shadow-lg"
                                              title={`${p.user.username}: ${Math.round(p.wpm)} WPM`}
                                            />
                                          ) : (
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                              |
                                            </div>
                                          )}
                                          <div className="text-xs text-blue-400 whitespace-nowrap mt-1 font-semibold">
                                            {p.user.username}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Your own cursor */}
                        <div className="absolute left-0 bottom-0 text-emerald-500 text-2xl font-bold animate-pulse">
                          {currentSentence && userInput.length < currentSentence.length ? '|' : '✓'}
                        </div>
                      </div>

                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleTyping}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Start typing..."
                        autoFocus
                      />
                    </div>
                  </div>
                </div>

                {/* Live Leaderboard */}
                <div className="bg-slate-800/90 rounded-xl p-6 border border-slate-700 h-fit sticky top-8">
                  <h3 className="text-lg font-bold text-emerald-400 mb-4">Live Rankings</h3>
                  <div className="space-y-3">
                    {participants
                      .slice()
                      .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))
                      .map((p, idx) => (
                        <div
                          key={p.userId}
                          className={`p-3 rounded-lg border transition-all ${
                            p.userId === currentUserId
                              ? 'bg-emerald-500/20 border-emerald-500/50'
                              : 'bg-slate-700/50 border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="font-bold text-emerald-400 w-6 text-center">{idx + 1}</div>
                              {p.user?.image && (
                                <img
                                  src={p.user.image}
                                  alt={p.user.username}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span className="text-sm font-medium text-slate-200 truncate">
                                {p.user.username}
                                {p.userId === currentUserId && ' (You)'}
                              </span>
                            </div>
                            {p.finished && <span className="text-green-400 text-xs font-bold">✓</span>}
                          </div>
                          <div className="text-xs space-y-1 ml-8">
                            <div className="flex justify-between">
                              <span className="text-slate-400">WPM:</span>
                              <span className="text-emerald-400 font-bold">{Math.round(p.wpm)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Raw:</span>
                              <span className="text-blue-400 font-bold">{Math.round(p.rawWpm || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Acc:</span>
                              <span className="text-slate-300">{Math.round(p.accuracy)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Prog:</span>
                              <span className="text-slate-300">{p.progress}/{currentSentence.length}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Screen */}
        {mode === 'results' && (
          <div className="max-w-4xl mx-auto py-12">
            {/* Winner Announcement */}
            {results.length > 0 && (
              <div className="text-center mb-8">
                <div className="inline-block p-8 bg-gradient-to-r from-yellow-500/20 to-emerald-500/20 rounded-2xl border border-yellow-500/30 mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h1 className="text-4xl font-bold text-yellow-400 mb-2">
                    Winner!
                  </h1>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {results[0].userImage && (
                      <img
                        src={results[0].userImage}
                        alt={results[0].userName}
                        className="w-16 h-16 rounded-full border-4 border-yellow-400"
                      />
                    )}
                    <div>
                      <p className="text-3xl font-bold text-slate-100">
                        {results[0].userName}
                      </p>
                      <p className="text-xl text-emerald-400 font-bold">
                        {Math.round(results[0].wpm)} WPM • {Math.round(results[0].rawWpm || 0)} Raw • {results[0].accuracy}% Accuracy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-4xl font-bold text-slate-100 mb-8 text-center">
              Final Rankings
            </h2>

            <div className="bg-slate-800/90 rounded-xl p-8 border border-slate-700">
              <div className="space-y-4">
                {results.map((result, idx) => (
                  <div
                    key={result.userId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      idx === 0
                        ? 'bg-gradient-to-r from-yellow-500/20 to-emerald-500/20 border border-yellow-500/30'
                        : idx === 1
                        ? 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/30'
                        : idx === 2
                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                        : 'bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-bold w-12 ${
                        idx === 0 ? 'text-yellow-400' :
                        idx === 1 ? 'text-slate-300' :
                        idx === 2 ? 'text-orange-400' :
                        'text-emerald-400'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        {result.userImage && (
                          <img
                            src={result.userImage}
                            alt={result.userName}
                            className="w-10 h-10 rounded-full border-2 border-slate-600"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-200">
                            {result.userName}
                          </p>
                          {idx === 0 && (
                            <p className="text-yellow-400 text-sm font-medium">🏆 Champion</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">
                        {Math.round(result.wpm)} WPM
                      </p>
                      <p className="text-sm text-blue-400 font-medium">
                        {Math.round(result.rawWpm || 0)} Raw WPM
                      </p>
                      <p className="text-slate-400">{result.accuracy}% Accuracy</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBackHome}
                className="w-full mt-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ArrowRightIcon className="w-5 h-5" />
                Race Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
