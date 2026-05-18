import { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Float } from '@react-three/drei';
import SunCalc from 'suncalc';
import Moon from './Moon';
import { MapPin, Edit3, Compass, Clock, RotateCcw } from 'lucide-react';

const LunarCalendar = () => {
  // Source of truth is just the date
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  
  const [moonInfo, setMoonInfo] = useState<SunCalc.GetMoonIlluminationResult | null>(null);
  const [locationName, setLocationName] = useState<string>("Detecting Location...");

  // Update moon info whenever date changes
  useEffect(() => {
    const info = SunCalc.getMoonIllumination(date);
    setMoonInfo(info);
  }, [date]);

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationName(`${position.coords.latitude.toFixed(2)}°N, ${position.coords.longitude.toFixed(2)}°E`);
      }, () => {
        setLocationName("Default Orbit (0°N, 0°E)");
      });
    }
  }, []);

  // Derived slider value (days from today)
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

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val) return;
    
    const parts = val.split('-');
    const newDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    if (!isNaN(newDate.getTime())) {
      setDate(newDate);
    }
  };

  const resetToToday = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    setDate(today);
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
    return 'Unknown';
  };

  const dateInputStr = useMemo(() => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [date]);

  return (
    <div className="lunar-container full-display">
      <div className="canvas-wrapper">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} />
          <Stars radius={250} depth={100} count={12000} factor={4} saturation={0} fade speed={0.1} />
          
          <Suspense fallback={null}>
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
              {moonInfo && <Moon phase={moonInfo.phase} />}
            </Float>
          </Suspense>

          <OrbitControls enablePan={false} minDistance={5} maxDistance={30} enableDamping />
        </Canvas>
      </div>

      <div className="ui-overlay">
        <aside className="sidebar">
          <header>
            <div className="logo-area">
              <Compass size={28} className="logo-icon" />
              <div>
                <h1>LUNAR SAT</h1>
                <p className="subtitle">Precision Satellite Link</p>
              </div>
            </div>
          </header>

          <nav className="info-panel scrollable">
            <section className="ui-group">
              <div className="group-header">
                <label>Time Control</label>
                <button className="reset-btn" onClick={resetToToday} title="Reset to Today">
                  <RotateCcw size={14} />
                  <span>RESET</span>
                </button>
              </div>
              
              <div className="scrubber-card">
                <div className="scrubber-header">
                  <Clock size={16} />
                  <span>Orbit Offset: {sliderValue > 0 ? `+${sliderValue}` : sliderValue} days</span>
                </div>
                <input 
                  type="range" 
                  min="-15" 
                  max="15" 
                  value={sliderValue} 
                  onChange={handleSliderChange}
                  className="time-slider"
                />
                <div className="slider-labels">
                  <span>-15 Days</span>
                  <span className={`today-marker ${sliderValue === 0 ? 'active' : ''}`}>TODAY</span>
                  <span>+15 Days</span>
                </div>
              </div>
            </section>

            <section className="ui-group">
              <label>Manual Target Date (DD-MM-YYYY)</label>
              <div className="date-input-container">
                <Edit3 size={18} className="input-icon-v2" />
                <input 
                  type="date" 
                  value={dateInputStr} 
                  onChange={handleManualDateChange}
                  className="manual-date-input"
                />
              </div>
              <div className="date-readout">
                {date.toLocaleDateString('en-GB').split('/').join(' - ')}
              </div>
            </section>

            <section className="ui-group">
              <label>Lunar Status</label>
              <div className="status-card">
                <div className="status-header">
                  <span className="phase-badge">{moonInfo ? getPhaseName(moonInfo.phase) : '...'}</span>
                  <div className="live-indicator-small">
                    <div className="dot"></div>
                    <span>LINKED</span>
                  </div>
                </div>
                <div className="illumination-meter">
                  <div className="meter-label">
                    <span>Luminosity</span>
                    <span>{moonInfo ? (moonInfo.fraction * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill" 
                      style={{ width: `${moonInfo ? moonInfo.fraction * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="ui-group">
              <label>Ground Station</label>
              <div className="status-card location-card">
                <MapPin size={18} className="card-icon" />
                <div className="location-info">
                  <span className="location-text">{locationName}</span>
                </div>
              </div>
            </section>
          </nav>

          <footer>
            <div className="footer-item">
              <div className="live-indicator"></div>
              <span>Encrypted Satellite Uplink</span>
            </div>
          </footer>
        </aside>
      </div>
    </div>
  );
};

export default LunarCalendar;
