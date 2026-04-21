import { clamp } from "@/lib/utils";

export type MacroInput = {
  ironOreChangePct: number;
  hrcChangePct: number;
  usdVndChangePct: number;
  interestRateChangePct: number;
  publicInvestmentChangePct: number;
  realEstateMomentum: number;
  chinaSteelExportChangePct: number;
};

export type MacroResult = {
  score: number;
  effects: {
    ironOreEffect: number;
    hrcEffect: number;
    usdVndEffect: number;
    interestEffect: number;
    publicInvestEffect: number;
    realEstateEffect: number;
    chinaExportEffect: number;
  };
  note: string;
};

export function calculateMacroScore(input: MacroInput): MacroResult {
  const ironOreEffect = clamp(Math.round(input.ironOreChangePct * -2), -15, 15);
  const hrcEffect = clamp(Math.round(input.hrcChangePct * 1.4), -10, 10);
  const usdVndEffect = clamp(Math.round(input.usdVndChangePct * -2), -12, 12);
  const interestEffect = clamp(Math.round(input.interestRateChangePct * -3), -12, 12);
  const publicInvestEffect = clamp(Math.round(input.publicInvestmentChangePct * 1.2), -12, 12);
  const realEstateEffect = clamp(Math.round(input.realEstateMomentum), -15, 15);
  const chinaExportEffect = clamp(Math.round(input.chinaSteelExportChangePct * -1.4), -12, 12);

  const score = clamp(
    50 +
      ironOreEffect +
      hrcEffect +
      usdVndEffect +
      interestEffect +
      publicInvestEffect +
      realEstateEffect +
      chinaExportEffect,
    0,
    100,
  );

  return {
    score,
    effects: {
      ironOreEffect,
      hrcEffect,
      usdVndEffect,
      interestEffect,
      publicInvestEffect,
      realEstateEffect,
      chinaExportEffect,
    },
    note: `Macro score ${score}/100 duoc tinh tu quang sat, HRC, USD/VND, lai suat va dau tu cong.`,
  };
}
