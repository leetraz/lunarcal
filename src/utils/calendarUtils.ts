import { DateTime } from 'luxon';
import { Lunar } from 'lunar-typescript';

export interface LunarDateInfo {
  islamic: string;
  chinese: string;
  hindu: string;
}

export const getLunarCalendarInfo = (date: Date): LunarDateInfo => {
  const dt = DateTime.fromJSDate(date);

  // Islamic (Hijri) - Using explicit calendar option for better compatibility
  // We try umalqura first as it is the most common official variant
  let islamic = "";
  try {
    islamic = new Intl.DateTimeFormat('en', {
      calendar: 'islamic-umalqura',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    // Fallback to standard islamic if umalqura is not supported
    islamic = new Intl.DateTimeFormat('en', {
      calendar: 'islamic',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  // Chinese Lunar - Using lunar-typescript
  const lunar = Lunar.fromDate(date);
  const chinese = `${lunar.getYearInGanZhi()} (${lunar.getYearShengXiao()}), ${lunar.getMonthInChinese()} Month, Day ${lunar.getDayInChinese()}`;

  // Hindu Calendar (Simplified Vikram Samvat + Tithi estimation)
  // Tithi is roughly the lunar phase * 30.
  const tithi = Math.floor(lunar.getDay());
  const hindu = `Vikram Samvat ${dt.year + 57}, Tithi ${tithi}`;

  return { islamic, chinese, hindu };
};

export const getAIInsight = async (phase: number) => {
  // AI context provider with more detailed astronomical and cultural insights
  const insights = [
    "New Moon: A time of rebirth and hidden potential. Great for setting new intentions.",
    "Waxing Crescent: Growth is beginning. Focus on the first steps of your new projects.",
    "First Quarter: Momentum is building. Expect some challenges as you push forward.",
    "Waxing Gibbous: Refinement phase. Perfect the details before the peak energy arrives.",
    "Full Moon: Peak illumination. A time for celebration, realization, and high emotions.",
    "Waning Gibbous: Gratitude and sharing. Reflect on what you've achieved this cycle.",
    "Last Quarter: Release and let go. Clear out the old to make room for the new.",
    "Waning Crescent: Rest and introspection. The cycle is closing, prepare for the next New Moon."
  ];
  
  const index = Math.min(insights.length - 1, Math.floor(phase * insights.length));
  return insights[index];
};
