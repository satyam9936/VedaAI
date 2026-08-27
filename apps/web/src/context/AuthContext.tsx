import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@vedaai/types';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
  register: (name: string, email: string, pass: string, institution: string) => boolean;
  loginAsDemo: () => void;
  logout: () => void;
}

const DEMO_TEACHER: UserSession = {
  id: 'teacher-101',
  name: 'Dr. Sarah Jenkins',
  email: 'sarah.jenkins@veda.edu',
  role: 'teacher',
  institution: 'Veda International Academy',
  department: 'Physics & Mathematical Sciences',
  authProvider: 'demo'
};

const GOOGLE_TEACHER: UserSession = {
  id: 'google-10928374',
  name: 'Satyam Rastogi',
  email: 'satyam.rastogi@gmail.com',
  role: 'teacher',
  institution: 'Delhi Public School, Bokaro Steel City',
  department: 'Biology & Physiology',
  avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
  authProvider: 'google',
  googleId: '10928374'
};

const GITHUB_TEACHER: UserSession = {
  id: 'github-8874129',
  name: 'Satyam Rastogi (GitHub)',
  email: 'satyam@github.com',
  role: 'teacher',
  institution: 'VedaAI Engineering & Education',
  department: 'AI & Automated Assessment',
  avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  authProvider: 'github',
  githubUsername: 'SatyamRastogi'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('VEDA_TEACHER_USER');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved auth user:', err);
      }
    } else {
      setUser(GOOGLE_TEACHER);
    }
  }, []);

  const login = (email: string, _pass: string) => {
    const teacherUser: UserSession = {
      id: `teacher-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role: 'teacher',
      institution: 'Veda Partner Institution',
      department: 'Science & Evaluation',
      authProvider: 'email'
    };
    setUser(teacherUser);
    localStorage.setItem('VEDA_TEACHER_USER', JSON.stringify(teacherUser));
    return true;
  };

  const loginWithGoogle = () => {
    setUser(GOOGLE_TEACHER);
    localStorage.setItem('VEDA_TEACHER_USER', JSON.stringify(GOOGLE_TEACHER));
  };

  const loginWithGitHub = () => {
    setUser(GITHUB_TEACHER);
    localStorage.setItem('VEDA_TEACHER_USER', JSON.stringify(GITHUB_TEACHER));
  };

  const register = (name: string, email: string, _pass: string, institution: string) => {
    const teacherUser: UserSession = {
      id: `teacher-${Date.now()}`,
      name,
      email,
      role: 'teacher',
      institution: institution || 'Veda Academy',
      department: 'Academic Faculty',
      authProvider: 'email'
    };
    setUser(teacherUser);
    localStorage.setItem('VEDA_TEACHER_USER', JSON.stringify(teacherUser));
    return true;
  };

  const loginAsDemo = () => {
    setUser(DEMO_TEACHER);
    localStorage.setItem('VEDA_TEACHER_USER', JSON.stringify(DEMO_TEACHER));
  };

  const logout = () => {
    setUser(GOOGLE_TEACHER);
    localStorage.removeItem('VEDA_TEACHER_USER');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: Boolean(user), 
      login, 
      loginWithGoogle, 
      loginWithGitHub,
      register, 
      loginAsDemo, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
