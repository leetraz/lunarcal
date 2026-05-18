import { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Float } from '@react-three/drei';
import SunCalc from 'suncalc';
import Moon from './Moon';
import PhaseChart from './PhaseChart';
import { MapPin, Compass, RotateCcw } from 'lucide-react';

const LunarCalendar = () => {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  
  const moonInfo = useMemo(() => SunCalc.getMoonIllumination(date), [date]);
  const [locationName, setLocationName] = useState<string>("Detecting...");

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
          <div className="location-tag">
            <MapPin size={12} />
            <span>{locationName}</span>
          </div>
        </header>

        <main className="hud-dashboard">
          <div className="dashboard-grid">
            <div className="status-row">
              <div className="phase-info">
                <h2>{moonInfo ? getPhaseName(moonInfo.phase) : '---'}</h2>
                <div className="date-readout">
                  {date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' . ')}
                </div>
              </div>
              <button className="reset-btn" onClick={() => setDate(new Date())}>
                <RotateCcw size={14} />
                <span>SYNC</span>
              </button>
            </div>

            <div className="control-panel">
              <div className="scrubber-label">
                <span>Temporal Scrubber</span>
                <div className="live-indicator-group">
                  <div className="live-indicator"></div>
                  <span style={{ fontSize: '0.6rem', marginLeft: '0.4rem' }}>LIVE FEED</span>
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
              <PhaseChart date={date} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LunarCalendar;
