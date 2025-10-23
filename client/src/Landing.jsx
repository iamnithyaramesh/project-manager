import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './Landing.css';
import heroMp4 from './assets/hero.mp4';

const FeatureCard = ({ title, desc, color }) => (
  <div className="feature-card" style={{ borderTop: `4px solid ${color}` }}>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

const VideoAnimation = () => (
  <div className="hero-video-wrap" aria-hidden="true">
    <video
      className="hero-video"
      src={heroMp4}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const openApp = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing">
      <header className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Proj-Space</h1>
          <p className="hero-sub">Your smart project management buddy!</p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={openApp}>Get Started</button>
            <button className="btn-outline" onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}>Explore Features</button>
          </div>
        </div>
        <div className="hero-visual">
          <VideoAnimation />
        </div>
      </header>

      <section className="features" id="features">
        <h2>What you get</h2>
        <div className="features-grid">
          <FeatureCard title="AI-Powered Project Management" desc="Automated requirement extraction (from emails, PDFs, and documents) with automatic task creation, tagging, and prioritization" color="#667eea" />
          <FeatureCard title="Smart Team & Resource Management" desc="AI-driven team formation and skill-based employee matching ,along with performance analytics.Impact scoring for employee appraisals" color="#764ba2" />
          <FeatureCard title="Collaboration & Scheduling" desc="Integration with Google Calendar, Outlook, Jira, Asana, and Trello.Hybrid Kanban–Gantt project views and real-time progress tracking" color="#10b981" />
          <FeatureCard title="Smart Notifications" desc="Requirement change notifications and smart reminders for project deadlines." color="#b97510ff" />
          <FeatureCard title="Client Analytics" desc="Client portal for deliverables and progress tracking and automated summaries." color="#d955a0ff"></FeatureCard>
        </div>
      </section>
    </div>
  );
};

export default Landing;