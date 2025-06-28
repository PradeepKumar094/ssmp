import { useState, useEffect } from 'react';
import axios from 'axios';
import Graph from './components/Graph';
import Quiz from './components/Quiz';
import LandingPage from './components/LandingPage';
import AuthForms from './components/AuthForms';
import UserProfile from './components/UserProfile';
import { v4 as uuidv4 } from 'uuid';
import AdminDashboard from './components/AdminDashboard';
import HeroSection from './components/HeroSection';

// Type definitions
type PrereqData = {
  topic: string;
  prerequisites: string[];
};

type MCQ = {
  id: string;
  topic: string;
  question: string;
  options: string[];
  answer: string;
};

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
}

function App() {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<PrereqData | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState('');
  const [conceptSummary, setConceptSummary] = useState('');
  const [showGraph, setShowGraph] = useState(true);
  const [currentQuizSessionId, setCurrentQuizSessionId] = useState<string>(uuidv4());
  const [attemptsToday, setAttemptsToday] = useState(0);
  const [canAttempt, setCanAttempt] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthForms, setShowAuthForms] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Set default authorization header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Check remaining attempts on mount or topic change
  useEffect(() => {
    const checkAttempts = async () => {
      if (!topic) return;
      try {
        const res = await axios.get('http://localhost:5000/api/quiz-attempts', {
          params: { topic },
        });
        setAttemptsToday(res.data.attemptsToday);
        setCanAttempt(res.data.canAttempt);
      } catch (err) {
        console.error('Error checking quiz attempts:', err);
        alert('Failed to verify quiz attempts. Please try again.');
      }
    };
    checkAttempts();
  }, [topic]);

  const handleAuthSuccess = (token: string, userData: User) => {
    setUser(userData);
    setShowAuthForms(false);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setUser(null);
    setShowUserProfile(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    // Reset all app state
    setTopic('');
    setData(null);
    setMcqs(null);
    setLoading(false);
    setIsAcknowledged(false);
    setQuizLoading(false);
    setSelectedConcept('');
    setConceptSummary('');
    setShowGraph(true);
    setCurrentQuizSessionId(uuidv4());
    setAttemptsToday(0);
    setCanAttempt(true);
    setQuizPassed(false);
  };

  const handleSubmit = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic.');
      return;
    }
    setLoading(true);
    setMcqs(null);
    setData(null);
    setSelectedConcept('');
    setConceptSummary('');
    setShowGraph(true);
    setIsAcknowledged(false);
    setCurrentQuizSessionId(uuidv4());
    setQuizPassed(false);
    setAttemptsToday(0);
    setCanAttempt(true);
    try {
      const res = await axios.post('http://localhost:5000/api/prerequisites', { topic });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching prerequisites:', err);
      alert('Failed to fetch prerequisites. Please check server and topic.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMCQs = async (resetCache: boolean = false) => {
    if (!data || (!isAcknowledged && !resetCache)) {
      if (!data) console.warn("No prerequisite data to fetch MCQs for.");
      if (!isAcknowledged && !resetCache) console.warn("Prerequisites not acknowledged yet.");
      return;
    }

    // Check attempts before fetching
    try {
      const res = await axios.get('http://localhost:5000/api/quiz-attempts', {
        params: { topic: data.topic },
      });
      setAttemptsToday(res.data.attemptsToday);
      setCanAttempt(res.data.canAttempt);
      if (!res.data.canAttempt) {
        alert(`Max attempts reached for ${data.topic} today. Please try again tomorrow.`);
        return;
      }
    } catch (err) {
      console.error('Error checking quiz attempts:', err);
      alert('Failed to verify quiz attempts. Please try again.');
      return;
    }

    setQuizLoading(true);
    setMcqs(null);
    setCurrentQuizSessionId(uuidv4());
    setQuizPassed(false);

    try {
      const res = await axios.post('http://localhost:5000/api/prerequisites/mcq', {
        prerequisites: data.prerequisites,
        restart: resetCache,
      });
      setMcqs(res.data);
      console.log("MCQs fetched successfully. Current quiz ID:", currentQuizSessionId);
    } catch (err) {
      console.error('Error fetching MCQs:', err);
      alert('Failed to fetch quiz questions. Please try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleConceptClick = async (concept: string) => {
    setSelectedConcept(concept);
    setConceptSummary('⏳ Loading...');
    setShowGraph(false);
    try {
      const res = await axios.post('http://localhost:5000/api/topic-summary', {
        topic: concept,
        mainTopic: data?.topic || '',
      });
      setConceptSummary(res.data.summary);
    } catch (err) {
      console.error('Error fetching summary', err);
      setConceptSummary('⚠️ Failed to load summary.');
    }
  };

  const handleQuizRestart = async (score: number, passed: boolean) => {
    console.log("App.tsx: Quiz restart requested by Quiz component. Score:", score, "Passed:", passed);
    if (passed) {
      console.log("Restart blocked: User passed the quiz.");
      setQuizPassed(true);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/quiz-attempts', {
        params: { topic: data?.topic },
      });
      setAttemptsToday(res.data.attemptsToday);
      setCanAttempt(res.data.canAttempt);
      if (!res.data.canAttempt) {
        console.log("Restart blocked: Max attempts reached.");
        return;
      }
    } catch (err) {
      console.error('Error checking quiz attempts:', err);
      alert('Failed to verify quiz attempts. Please try again.');
      return;
    }

    setIsAcknowledged(false);
    await fetchMCQs(true);
  };

  const handleQuizSubmit = async (score: number, total: number) => {
    const passed = (score / total) * 100 >= 65;
    setQuizPassed(passed);
    try {
      await axios.post('http://localhost:5000/api/quiz-attempts', {
        quizId: currentQuizSessionId,
        score: (score / total) * 100,
        passed,
        topic: data?.topic,
      });
      setAttemptsToday((prev) => prev + 1);
      setCanAttempt(attemptsToday + 1 < 3);
    } catch (err) {
      console.error('Error recording quiz attempt:', err);
      alert('Failed to record quiz attempt. Please try again.');
    }
  };

  return (
    <>
      {showAuthForms && (
        <AuthForms onAuthSuccess={handleAuthSuccess} onClose={() => setShowAuthForms(false)} />
      )}
      {user && user.role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <LandingPage 
          onStartLearning={() => setShowAuthForms(true)}
          onAuthClick={() => setShowAuthForms(true)}
        />
      )}
      {showUserProfile && user && (
        <UserProfile user={user} onLogout={handleLogout} onClose={() => setShowUserProfile(false)} />
      )}
    </>
  );
}

export default App;