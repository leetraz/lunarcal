import { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Float } from '@react-three/drei';
import SunCalc from 'suncalc';
import Moon from './Moon';
import PhaseChart from './PhaseChart';
import { MapPin, Compass, RotateCcw, Calendar, Bot } from 'lucide-react';
import { getLunarCalendarInfo, getAIInsight } from '../utils/calendarUtils';
import { motion, AnimatePresence } from 'framer-motion';

const LunarCalendar = () => {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  
  const [locationName, setLocationName] = useState<string>("Detecting...");
  const [aiInsight, setAiInsight] = useState<{ title: string; content: string }>({ title: "", content: "" });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'calendars' | 'ai'>('status');

  const moonInfo = useMemo(() => SunCalc.getMoonIllumination(date), [date]);
  const calendarInfo = useMemo(() => getLunarCalendarInfo(date), [date]);

  useEffect(() => {
    const fetchAi = async () => {
      if (moonInfo) {
        setIsAiLoading(true);
        // Artificial delay for 'processing' effect
        await new Promise(r => setTimeout(r, 800));
        const insight = await getAIInsight(moonInfo.phase);
        setAiInsight(insight);
        setIsAiLoading(false);
      }
    };
    fetchAi();
  }, [date, moonInfo]);


  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationName(`${position.coords.latitude.toFixed(1)}°N, ${position.coords.longitude.toFixed(1)}°E`);
      }, () => {
        setLocationName("Orbit Alpha");
      });
    }
  }, []);

  const sliderValue = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }, [date]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const offset = parseInt(e.target.value);
    const newDate = new Date();
    newDate.setHours(12, 0, 0, 0);
    newDate.setDate(newDate.getDate() + offset);
    setDate(newDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      newDate.setHours(12, 0, 0, 0);
      setDate(newDate);
    }
  };

  const getPhaseName = (phase: number) => {
    if (phase <= 0.03 || phase >= 0.97) return 'New Moon';
    if (phase > 0.03 && phase < 0.22) return 'Waxing Crescent';
    if (phase >= 0.22 && phase <= 0.28) return 'First Quarter';
    if (phase > 0.28 && phase < 0.47) return 'Waxing Gibbous';
    if (phase >= 0.47 && phase <= 0.53) return 'Full Moon';
    if (phase > 0.53 && phase < 0.72) return 'Waning Gibbous';
    if (phase >= 0.72 && phase <= 0.78) return 'Last Quarter';
    if (phase > 0.78 && phase < 0.97) return 'Waning Crescent';
    return 'Analyzing';
  };

  return (
    <div className="lunar-container full-display">
      <div className="hud-vignette"></div>
      <div className="hud-scanline"></div>
      
      <div className="canvas-wrapper">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <Stars radius={250} depth={100} count={12000} factor={4} saturation={0} fade speed={0.1} />
          <Suspense fallback={null}>
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
              {moonInfo && <Moon phase={moonInfo.phase} />}
            </Float>
          </Suspense>
          <OrbitControls enablePan={false} minDistance={5} maxDistance={20} enableDamping />
        </Canvas>
      </div>

      <div className="ui-overlay">
        <header className="hud-header">
          <div className="logo-group">
            <Compass size={24} className="logo-icon" />
            <h1>Lunar Sat</h1>
          </div>
          <div className="header-actions">
            <div className="date-picker-wrapper">
              <Calendar size={16} />
              <input 
                type="date" 
                onChange={handleDateChange} 
                value={date.toISOString().split('T')[0]}
                className="hud-date-input"
              />
            </div>
            <div className="location-tag hide-mobile">
              <MapPin size={12} />
              <span>{locationName}</span>
            </div>
          </div>
        </header>

        <main className="hud-dashboard">
          <div className="tab-navigation">
            <button className={activeTab === 'status' ? 'active' : ''} onClick={() => setActiveTab('status')}>DATA</button>
            <button className={activeTab === 'calendars' ? 'active' : ''} onClick={() => setActiveTab('calendars')}>SYSTEMS</button>
            <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>AI INSIGHT</button>
          </div>

          <div className="dashboard-grid">
            <AnimatePresence mode="wait">
              {activeTab === 'status' && (
                <motion.div 
                  key="status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="tab-content"
                >
                  <div className="status-row">
                    <div className="phase-info">
                      <div className="phase-header">
                        <h2>{moonInfo ? getPhaseName(moonInfo.phase) : '---'}</h2>
                        <span className="illumination-tag">
                          {moonInfo ? `${Math.round(moonInfo.fraction * 100)}% ILLUM` : '--%'}
                        </span>
                      </div>
                      <div className="lunar-date-readout">
                        LUNAR DAY {moonInfo ? (Math.floor(moonInfo.phase * 29.53) + 1).toString().padStart(2, '0') : '--'}
                      </div>
                      <div className="date-readout">
                        {date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' . ')}
                      </div>
                    </div>
                    <button className="reset-btn" onClick={() => setDate(new Date())}>
                      <RotateCcw size={14} />
                    </button>
                  </div>
                  
                  <div className="control-panel">
                    <div className="scrubber-label">
                      <span>Temporal Scrubber</span>
                      <div className="live-indicator-group">
                        <div className="live-indicator"></div>
                        <span style={{ fontSize: '0.6rem', marginLeft: '0.4rem' }}>LIVE</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="-15" 
                      max="15" 
                      value={sliderValue} 
                      onChange={handleSliderChange}
                      className="time-slider"
                    />
                    <div className="slider-markers">
                      <span>-15D</span>
                      <span className={sliderValue === 0 ? 'marker-now' : ''}>
                        {sliderValue === 0 ? 'TODAY' : `${sliderValue > 0 ? '+' : ''}${sliderValue}D`}
                      </span>
                      <span>+15D</span>
                    </div>
                    <div className="chart-wrapper hide-mobile">
                      <PhaseChart date={date} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'calendars' && (
                <motion.div 
                  key="calendars"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="tab-content"
                >
                  <div className="calendar-details-static">
                    <div className="cal-item highlight">
                      <span className="cal-label">Islamic (Hijri)</span>
                      <span className="cal-value">{calendarInfo.islamic}</span>
                    </div>
                    <div className="cal-item">
                      <span className="cal-label">Hindu (Panchang)</span>
                      <span className="cal-value">{calendarInfo.hindu}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div 
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="tab-content"
                >
                  <div className="ai-insight-panel-full">
                    <div className="ai-status">
                      <Bot size={18} className="ai-icon-pulsing" />
                      <div className="ai-title-group">
                        <span className="ai-tag">QUANTUM ANALYZER</span>
                        <h3 className={isAiLoading ? 'glow-text' : ''}>
                          {isAiLoading ? "SCANNING SECTORS..." : aiInsight.title}
                        </h3>
                      </div>
                    </div>
                    <div className="ai-body">
                      {isAiLoading ? (
                        <div className="loading-bars">
                          <div className="bar"></div>
                          <div className="bar"></div>
                          <div className="bar"></div>
                        </div>
                      ) : (
                        <p className="typewriter">{aiInsight.content}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LunarCalendar;
