import { DateTime } from 'luxon';
import { Lunar } from 'lunar-typescript';

export interface LunarDateInfo {
  islamic: string;
  chinese: string;
  hindu: string;
}

export const getLunarCalendarInfo = (date: Date): LunarDateInfo => {
  const dt = DateTime.fromJSDate(date);

  // Islamic (Hijri) - Using Intl for reliability
  const islamic = new Intl.DateTimeFormat('en-u-ca-islamic-uma', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  // Chinese Lunar - Using lunar-typescript
  const lunar = Lunar.fromDate(date);
  const chinese = `Year ${lunar.getYearInGanZhi()} (${lunar.getYearShengXiao()}), Month ${lunar.getMonthInChinese()}, Day ${lunar.getDayInChinese()}`;

  // Hindu Calendar (Approximate calculation for Tithi)
  // Real Panchang calculation is very complex; we'll provide a simplified version or 
  // recommendation for a full library if needed. For now, a simplified Tithi-based label.
  const hindu = `Vikram Samvat ${dt.year + 57}, Tithi based on ${Math.floor(lunar.getDay())}`;

  return { islamic, chinese, hindu };
};

export const getAIInsight = async (phase: number) => {
  // Simplified AI context provider
  // In a real app, this would hit an LLM endpoint
  const insights = [
    "The high illumination suggests a time of peak energy and visibility.",
    "The current lunar cycle is ideal for setting intentions and new beginnings.",
    "Ancient traditions often view this phase as a period of reflection and release.",
    "The alignment with current astronomical data indicates stable tidal patterns."
  ];
  
  // Return a deterministic "AI" response for now to ensure reliability
  const index = Math.min(insights.length - 1, Math.floor(phase * insights.length));
  return insights[index];
};
