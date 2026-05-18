import { DateTime } from 'luxon';
import { Lunar } from 'lunar-typescript';

export interface LunarDateInfo {
  islamic: string;
  chinese: string;
  hindu: string;
}

export const getLunarCalendarInfo = (date: Date): LunarDateInfo => {
  const dt = DateTime.fromJSDate(date);

  // Islamic (Hijri) - Using the correct Unicode extension for reliable Hijri output
  let islamic = "";
  try {
    islamic = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    // Fallback if umalqura extension is not supported
    islamic = new Intl.DateTimeFormat('en-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  // Chinese Lunar
  const lunar = Lunar.fromDate(date);
  const chinese = `${lunar.getYearInGanZhi()} (${lunar.getYearShengXiao()}), ${lunar.getMonthInChinese()} Month, Day ${lunar.getDayInChinese()}`;

  // Hindu Calendar
  const tithi = Math.floor(lunar.getDay());
  const hindu = `Vikram Samvat ${dt.year + 57}, Tithi ${tithi}`;

  return { islamic, chinese, hindu };
};

export const getAIInsight = async (phase: number) => {
  const insights = [
    {
      title: "Zero Point Phase",
      content: "Deep space observation shows minimum albedo. A period of maximum gravitational pull and atmospheric stillness. Ideal for internal recalibration."
    },
    {
      title: "Emergence Vector",
      content: "Photon reflection increasing on the western limb. Momentum is building in the lunar cycle. Initiate primary project phases now."
    },
    {
      title: "Equilibrium Point",
      content: "Orbital terminator reached. Surface shadow at 50%. High contrast topography visible. Dynamic balance between growth and stability."
    },
    {
      title: "Luminous Expansion",
      content: "Radiation pressure peaking. Surface saturation at 85%+. Heightened emotional resonance and clarity of vision. Finalize your trajectory."
    },
    {
      title: "Peak Zenith",
      content: "Maximum solar reflectance. Total lunar saturation. High-energy state confirmed. A window for peak performance and public manifestation."
    },
    {
      title: "Reflective Decay",
      content: "Entropy cycle initiated. Illumination retreating from the eastern limb. Period for harvesting results and synthesizing data."
    },
    {
      title: "Structural Release",
      content: "Terminal phase reached. Shadow coverage at 50%. Gravitational shifts detected. Time for shedding redundant systems and streamlining."
    },
    {
      title: "Void Convergence",
      content: "Final descent into shadow. Minimum interference state. High sensitivity for intuitive processing. Rest systems for next cycle."
    }
  ];
  
  const index = Math.min(insights.length - 1, Math.floor(phase * insights.length));
  return insights[index];
};
