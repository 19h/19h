export type Year = {
  from: string;
  to: string;
  days: number[];
};

export type StatsData = {
  years: Year[];
  contributions: number;
};
