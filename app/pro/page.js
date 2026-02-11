  "use client";
import { useState, useEffect } from 'react';
import { TrophyIcon, ClockIcon, ChartBarIcon, ArrowPathIcon, UserIcon, ArrowTrendingUpIcon, RocketLaunchIcon, UserGroupIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import TrueFocus from '../pro/TrueFocus';
import SkeletonLoader from '../components/SkeletonLoader';

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [maleScores, setMaleScores] = useState([]);
  const [femaleScores, setFemaleScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchScores();
  }, [genderFilter]);

  useEffect(() => {
    filterScoresByGender();
  }, [maleScores, femaleScores, genderFilter]);

  const filterScoresByGender = () => {
    if (genderFilter === 'all') {
      setFilteredScores([...maleScores, ...femaleScores]);
    } else if (genderFilter === 'male') {
      setFilteredScores(maleScores);
    } else if (genderFilter === 'female') {
      setFilteredScores(femaleScores);
    }
  };

  const fetchScores = async () => {
    try {
      setLoading(true);
      // Pass gender as query parameter
      const url = new URL('/api/scores', window.location.origin);
      if (genderFilter && genderFilter !== 'all') {
        url.searchParams.append('gender', genderFilter);
      }
      const response = await fetch(url.toString());
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (!response.ok) {
        console.error('API Error:', response.status, data);
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }
      
      const scoresData = data.data || [];
      console.log('Scores data received:', scoresData);
      
      if (scoresData.length > 0) {
        console.log('Sample score:', scoresData[0]);
      }
      
      const uniqueUserScores = processUniqueHighestScores(scoresData);
      
      // Split by gender and take top 20 of each
      const males = uniqueUserScores
        .filter(score => score.user?.gender?.toLowerCase() === 'male')
        .slice(0, 20);
      
      const females = uniqueUserScores
        .filter(score => score.user?.gender?.toLowerCase() === 'female')
        .slice(0, 20);
      
      console.log('Males:', males.length, 'Females:', females.length);
      
      setScores(uniqueUserScores);
      setMaleScores(males);
      setFemaleScores(females);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message || 'Failed to fetch scores');
      setScores([]);
      setMaleScores([]);
      setFemaleScores([]);
      setLoading(false);
    }
  };

  const processUniqueHighestScores = (allScores) => {
    const userMap = new Map();
    
    allScores.forEach(score => {
      const username = (score.user?.username || '').trim().toLowerCase();
      if (username) {
        if (!userMap.has(username) || score.wpm > userMap.get(username).wpm) {
          userMap.set(username, {
            ...score,
            name: score.user?.username || 'Anonymous',
            gender: score.user?.gender,
            image: score.user?.image,
          });
        }
      }
    });
    
    return Array.from(userMap.values())
      .sort((a, b) => b.wpm - a.wpm);
  };

  const handleStartNewTest = () => {
    router.push('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-rose-500 text-center">
          <p className="text-xl font-semibold">Error loading leaderboard</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchScores}
            className="mt-4 px-4 py-2 bg-emerald-500 text-slate-900 rounded-lg hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-slate-200 flex items-center justify-center gap-3">
            <RocketLaunchIcon className="w-10 h-10 text-emerald-500 mr-5 animate-bounce" />
            <TrueFocus />
          </h1>
          <br />
          <p className="text-slate-400 mt-2">Top speeds and highest accuracy</p>
          
          {/* Gender Filter Buttons */}
          <div className="flex justify-center gap-3 mt-6 mb-6">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                genderFilter === 'all'
                  ? 'bg-emerald-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                genderFilter === 'male'
                  ? 'bg-emerald-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                genderFilter === 'female'
                  ? 'bg-emerald-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Female
            </button>
          </div>
          
          <button
            onClick={handleStartNewTest}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-900 
                     rounded-lg hover:bg-emerald-600 transition-colors font-medium"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Take Another Test
          </button>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : filteredScores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No scores available for this filter. Be the first to set a record!</p>
            <p className="text-slate-500 text-sm mt-2">Total users: {scores.length} (Males: {maleScores.length}, Females: {femaleScores.length})</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-center items-center gap-4">
              <div className="text-center">
                <p className="text-emerald-400 text-2xl font-bold">{filteredScores.length}</p>
                <p className="text-slate-400 text-sm">Champion{filteredScores.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Leaderboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredScores.map((score, index) => (
                <div
                  key={`${score.id}-${index}`}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-bl-lg font-bold">
                    #{index + 1}
                  </div>

                  {/* Profile Image */}
                  <div className="relative h-40 bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden">
                    {score.user?.image ? (
                      <img
                        src={score.user.image}
                        alt={score.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <UserIcon className="w-24 h-24 text-slate-800" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-100 truncate mb-1">{score.name}</h3>
                    {score.user?.gender && (
                      <p className="text-xs text-emerald-400 capitalize mb-3 font-medium">
                        {score.user.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                        <div className="flex items-center gap-2 text-slate-300">
                          <ClockIcon className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm">WPM</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-400">{score.wpm}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                        <div className="flex items-center gap-2 text-slate-300">
                          <ChartBarIcon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">Accuracy</span>
                        </div>
                        <span className="text-lg font-bold text-blue-400">{score.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}