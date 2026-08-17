export type ChoiceKey =
  | 'morningPerson'
  | 'ageRange'
  | 'profile'
  | 'bedBlocker'
  | 'alarmThought'
  | 'alarmCount'
  | 'oneAlarm'
  | 'turnOffAlarm'
  | 'nightFeeling'
  | 'awakeDuration'
  | 'mission'
  | 'alarmSound'
  | 'missionAlarm'
  | 'wakeFeeling'
  | 'source';

export type Answers = {
  morningPerson?: string;
  ageRange?: string;
  profile?: string;
  bedBlocker?: string;
  alarmThought?: string;
  alarmCount?: string;
  oneAlarm?: string;
  turnOffAlarm?: string;
  nightFeeling?: string;
  awakeDuration?: string;
  mission?: string;
  missionUnit?: 'Time' | 'Reps';
  missionAmount?: number;
  days: string[];
  alarmSound?: string;
  missionAlarm?: string;
  referralCode?: string;
  wakeFeeling?: string;
  source?: string;
  bedtimeHour: number;
  bedtimeMinute: number;
  bedtimePeriod: 'AM' | 'PM';
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
};

export type ScreenKind =
  | 'intro'
  | 'energy'
  | 'comparison'
  | 'biology'
  | 'choice'
  | 'quote'
  | 'time'
  | 'target'
  | 'mission'
  | 'missionSetup'
  | 'missionWhy'
  | 'firstWayk'
  | 'days'
  | 'sound'
  | 'referral'
  | 'speedResult'
  | 'notifications'
  | 'commitment'
  | 'setupProgress'
  | 'morningPlan'
  | 'unlock'
  | 'account'
  | 'complete';

export type ScreenConfig = {
  kind: ScreenKind;
  title?: string;
  subtitle?: string;
  answerKey?: ChoiceKey;
  options?: Array<{ label: string; icon?: string }>;
  timeField?: 'bedtime' | 'wake';
};
