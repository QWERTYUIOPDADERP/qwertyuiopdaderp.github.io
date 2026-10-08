import React, { useState, useEffect } from 'react';
import { Github, Mail, Linkedin, ExternalLink, Calendar, Code, Server, Users, Award, MapPin } from 'lucide-react';

// --- Hooks ---
const useKonamiCode = (onUnlock) => {
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          onUnlock();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUnlock]);
};

// --- Components ---
const Badge = ({ children }) => (
  <span className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
    {children}
  </span>
);

const Card = ({ title, subtitle, date, children, skills, link }) => (
  <div className="group relative flex flex-col items-start justify-between p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
    <div className="flex items-center justify-between w-full mb-4">
      <div>
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
          {title} {link && <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </h3>
        {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {date && <span className="text-sm text-zinc-500 whitespace-nowrap">{date}</span>}
    </div>
    <div className="text-zinc-300 text-sm leading-relaxed mb-6 space-y-3 w-full">
      {children}
    </div>
    {skills && (
      <div className="flex flex-wrap gap-2 mt-auto">
        {skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
    )}
  </div>
);

// --- Pages ---
const Home = () => (
  <div className="animate-fade-in space-y-12">
    <header className="max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Matthew Castello</h1>
      <h2 className="text-xl md:text-2xl text-zinc-400 font-medium mb-6">Software Engineer & UCSD CS Student</h2>
      <p className="text-lg text-zinc-300 leading-relaxed mb-8">
        I build robust backend systems, local AI tools, and autonomous robotics software. 
        Fascinated by machine unlearning, AI ethics, and systems that bridge the physical and digital worlds. 
      </p>
      <div className="flex gap-4">
        <a href="https://github.com/QWERTYUIOPDADERP" target="_blank" rel="noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-white">
          <Github size={20} />
        </a>
        <a href="mailto:mcastello@ucsd.edu" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-white">
          <Mail size={20} />
        </a>
      </div>
    </header>

    <section>
      <h3 className="text-xl font-semibold text-white mb-6 border-b border-zinc-800 pb-2">Quick Highlights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <Code className="text-blue-400 mb-2" size={24} />
          <h4 className="font-medium text-white">Full-Stack Development</h4>
          <p className="text-sm text-zinc-400 mt-1">PHP backend features, interactive educational games, and React frontend systems.</p>
        </div>
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <Server className="text-green-400 mb-2" size={24} />
          <h4 className="font-medium text-white">Local AI & Systems</h4>
          <p className="text-sm text-zinc-400 mt-1">Built sandboxed, voice-activated LLM agents via Ollama and whisper.cpp on Linux Mint.</p>
        </div>
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <Award className="text-purple-400 mb-2" size={24} />
          <h4 className="font-medium text-white">Robotics Leadership</h4>
          <p className="text-sm text-zinc-400 mt-1">Directed software subteam for an 80+ member FRC team, qualifying for World Champs 2x.</p>
        </div>
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <Users className="text-orange-400 mb-2" size={24} />
          <h4 className="font-medium text-white">Community Impact</h4>
          <p className="text-sm text-zinc-400 mt-1">350+ hours volunteering, organizing at-risk youth camps, and Make-A-Wish fundraising.</p>
        </div>
      </div>
    </section>
  </div>
);

const Experience = () => (
  <div className="animate-fade-in space-y-12">
    <section>
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Experience</h2>
      <div className="space-y-6">
        <Card 
          title="Junior Programmer" 
          subtitle="PreLicenseTraining (Remote)" 
          date="Summer 2026"
          skills={['PHP', 'Backend Dev', 'QA Testing']}
        >
          <ul className="list-disc ml-4 space-y-2">
            <li>Developed backend features in PHP for an online insurance exam-prep platform.</li>
            <li>Designed and engineered three interactive study games (crossword, true/false, trivia-show format) to replace traditional flashcard reviews.</li>
            <li>Conducted rigorous QA testing to identify, document, and patch critical site bugs across 170+ hours of work.</li>
          </ul>
        </Card>

        <Card 
          title="Administrative Lead & Programming Director" 
          subtitle="Buchanan Bird Brains (FRC 1671)" 
          date="2023 - 2026"
          skills={['Java', 'Team Leadership', 'Constraint Programming', 'Curriculum Design']}
        >
          <ul className="list-disc ml-4 space-y-2">
            <li>Led a subteam of 4–11 student programmers, building an onboarding curriculum that increased competition-ready programmers by 300%.</li>
            <li>Developed a constraint-programming algorithm to generate fair, optimized event schedules for 80+ members in under 15 seconds.</li>
            <li>Contributed to software improvements (dynamic pathfinding, vision systems) that climbed competitive rankings by 350+ places and secured back-to-back FIRST World Championship qualifications.</li>
          </ul>
        </Card>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Education</h2>
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/30">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white">University of California, San Diego</h3>
            <p className="text-zinc-400">B.S. Computer Science</p>
          </div>
          <span className="text-zinc-500 text-sm">Expected 2030</span>
        </div>
        <p className="text-sm text-zinc-300 mt-4"><strong className="text-white">Current Coursework:</strong> CSE 11 (Intro to Programming), CSE 20 (Discrete Math), MATH 18 (Linear Algebra), LIGN 5</p>
      </div>
    </section>
  </div>
);

const Projects = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Featured Projects</h2>
    <div className="grid grid-cols-1 gap-6">
      <Card 
        title="Jarvis — Local AI Voice/Text Assistant" 
        skills={['Python', 'whisper.cpp', 'Ollama', 'Qwen3', 'Linux Automation']}
      >
        <p>A locally hosted assistant utilizing whisper.cpp for speech-to-text and an Ollama/Qwen3 LLM. Designed with a strict tiered permission system that gates read-only, logged, and confirmation-required actions to safely sandbox shell execution.</p>
      </Card>

      <Card 
        title="Wallpaper Engine — Linux Desktop Controller" 
        skills={['Python', 'GTK', 'X11', 'mpv', 'xwinwrap']}
      >
        <p>A multi-monitor animated wallpaper manager built for Linux Mint (X11). Features custom occlusion detection using <code>wmctrl</code> and <code>xprop</code> to pause video playback when windows are fully maximized, saving CPU/GPU overhead.</p>
      </Card>

      <Card 
        title="FRC Mobile Scouting Application" 
        skills={['Java', 'XML', 'Android', 'Google Sheets API']}
      >
        <p>An Android app for collecting match data offline during Wi-Fi-restricted competitions. Encodes data into dynamic QR codes, which are scanned into a master database and synced automatically to a Google Sheet for alliance selection analysis.</p>
      </Card>

      <Card 
        title="High-Fidelity Scouting Website" 
        skills={['Figma', 'React', 'TypeScript', 'Cellular Networking']}
      >
        <p>The successor to the Android app, rebuilt as a cellular-optimized web application. Features an interactive field diagram built in React that allows strategy analysts to draw and record autonomous robot paths directly on a canvas.</p>
      </Card>
    </div>
  </div>
);

const Leadership = () => (
  <div className="animate-fade-in space-y-12">
    <section>
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Community & Service</h2>
      <div className="space-y-6">
        <Card 
          title="Teens That Care (TTC) Leadership" 
          subtitle="350+ Volunteer Hours"
        >
          <p>Organized and led a 7-week summer camp at Rescue the Children for at-risk youth, growing attendance to 30 participants. Served consistently at homeless shelters, adaptive sports events, and local food banks.</p>
        </Card>

        <Card 
          title="Make-A-Wish Fundraising Organizer" 
          subtitle="170+ Volunteer Hours"
        >
          <p>Led youth volunteers in planning large-scale local events, managing registration, silent auctions, and finances to successfully fund three wishes for critically ill children in the community.</p>
        </Card>
        
        <Card 
          title="FIRST LEGO League Robotics Coach" 
        >
          <p>Mentored two elementary robotics teams in basic design principles, programming logic, and presentation skills. Refereed and judged six regional FLL competitions to expand STEAM access.</p>
        </Card>
      </div>
    </section>
    
    <section>
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">Extracurriculars</h2>
      <Card title="Marathon Runner" subtitle="Time: 3:04:03">
        <p>Trained independently outside of school athletics to run a marathon, placing 4th in the sub-20 age division. Built discipline through early morning distance training and pacing strategy.</p>
      </Card>
    </section>
  </div>
);

// --- Main App ---
export default function PortfolioApp() {
  const [currentPath, setCurrentPath] = useState('home');
  const [hackerMode, setHackerMode] = useState(false);

  useKonamiCode(() => setHackerMode(!hackerMode));

  useEffect(() => {
    // Console Easter Egg for recruiters inspecting the page
    console.log("%cHello Recruiter! \n%cLooking for bugs? Or just checking my React structure? \nEither way, feel free to reach out at mcastello@ucsd.edu", 
      "color: #4ade80; font-size: 20px; font-weight: bold;", 
      "color: #a1a1aa; font-size: 14px;"
    );
  }, []);

  const renderPage = () => {
    switch(currentPath) {
      case 'home': return <Home />;
      case 'experience': return <Experience />;
      case 'projects': return <Projects />;
      case 'leadership': return <Leadership />;
      default: return <Home />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-zinc-200 font-sans'}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-6 mb-12 border-b border-zinc-800 pb-6">
          {['Home', 'Experience', 'Projects', 'Leadership'].map(page => (
            <button
              key={page}
              onClick={() => setCurrentPath(page.toLowerCase())}
              className={`text-sm font-medium tracking-wide transition-all ${
                currentPath === page.toLowerCase() 
                  ? `${hackerMode ? 'text-green-400 border-green-400' : 'text-white border-white'} border-b-2 pb-1` 
                  : `${hackerMode ? 'text-green-800 hover:text-green-500' : 'text-zinc-500 hover:text-zinc-300'} pb-1`
              }`}
            >
              {page}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="min-h-[60vh]">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className={`mt-24 pt-8 border-t ${hackerMode ? 'border-green-900 text-green-800' : 'border-zinc-800 text-zinc-500'} text-sm flex justify-between items-center`}>
          <p>© {new Date().getFullYear()} Matthew Castello. Built with React.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><MapPin size={14}/> San Diego, CA</span>
          </div>
        </footer>
      </div>
    </div>
  );
}