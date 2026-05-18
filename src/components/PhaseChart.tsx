import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import SunCalc from 'suncalc';

interface PhaseChartProps {
  date: Date;
}

const PhaseChart = ({ date }: PhaseChartProps) => {
  const data = useMemo(() => {
    const points = [];
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 15);
    
    for (let i = 0; i <= 30; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const info = SunCalc.getMoonIllumination(d);
      points.push({
        day: d.getDate(),
        fullDate: d.toLocaleDateString(),
        illumination: Math.round(info.fraction * 100),
        isToday: i === 15,
      });
    }
    return points;
  }, [date]);

  return (
    <div className="phase-chart-container" style={{ width: '100%', height: 80, marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIllum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8e94f2" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8e94f2" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem' }}
            itemStyle={{ color: '#8e94f2' }}
            labelStyle={{ display: 'none' }}
          />
          <Area 
            type="monotone" 
            dataKey="illumination" 
            stroke="#8e94f2" 
            fillOpacity={1} 
            fill="url(#colorIllum)" 
            strokeWidth={2}
            isAnimationActive={false}
          />
          <XAxis dataKey="day" hide />
          <YAxis hide domain={[0, 100]} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PhaseChart;
