import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChoiceCard,
  EnergyChart,
  PrimaryButton,
  ProgressHeader,
  SignaturePad,
  TimeWheel,
} from './components';
import { screens } from './data';
import { colors, layout, scale } from './theme';
import { Answers, ChoiceKey, ScreenConfig } from './types';

const initialAnswers: Answers = {
  days: [],
  missionUnit: 'Time',
  missionAmount: 15,
  bedtimeHour: 11,
  bedtimeMinute: 0,
  bedtimePeriod: 'PM',
  hour: 7,
  minute: 30,
  period: 'AM',
};

export function OnboardingApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [showMorningIntro, setShowMorningIntro] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [language, setLanguage] = useState('English');
  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [signed, setSigned] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(18)).current;
  const splashScale = useRef(new Animated.Value(0.88)).current;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(splashScale, {
          toValue: 1,
          damping: 10,
          stiffness: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(850),
      Animated.timing(fade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
      setShowMorningIntro(true);
    });
    // Splash animation runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateIn = () => {
    fade.setValue(0);
    translate.setValue(18);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goTo = (nextIndex: number) => {
    Animated.timing(fade, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setScreenIndex(Math.max(0, Math.min(nextIndex, screens.length - 1)));
      animateIn();
    });
  };

  const select = (key: ChoiceKey, value: string) =>
    setAnswers(current => ({ ...current, [key]: value }));

  if (showSplash) {
    return (
      <View style={[styles.splash, { paddingTop: insets.top }]}>
        <Animated.View
          style={{ opacity: fade, transform: [{ scale: splashScale }] }}
        >
          <View style={styles.logoRing} />
          <Text style={styles.logo}>Wayk</Text>
        </Animated.View>
      </View>
    );
  }

  if (showMorningIntro) {
    return (
      <MorningIntroAnimation
        onComplete={() => {
          setShowMorningIntro(false);
          setShowWelcome(true);
        }}
      />
    );
  }

  if (showWelcome) {
    return (
      <>
        <WelcomeScreen
          language={language}
          onLanguage={() => setShowLanguages(true)}
          onStart={() => {
            setShowWelcome(false);
            fade.setValue(0);
            animateIn();
          }}
        />
        <LanguageSheet
          visible={showLanguages}
          selected={language}
          onClose={() => setShowLanguages(false)}
          onSelect={next => {
            setLanguage(next);
            setShowLanguages(false);
          }}
        />
      </>
    );
  }

  const screen = screens[screenIndex];
  const isCompact = width < 370;
  const progress = (screenIndex + 1) / screens.length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {!['complete', 'setupProgress', 'morningPlan', 'account'].includes(
        screen.kind,
      ) ? (
        <ProgressHeader
          progress={progress}
          onBack={() => {
            if (screenIndex === 0) {
              setShowWelcome(true);
              return;
            }
            goTo(screenIndex - 1);
          }}
        />
      ) : null}
      <Animated.View
        style={[
          styles.animated,
          { opacity: fade, transform: [{ translateY: translate }] },
        ]}
      >
        <Screen
          config={screen}
          answers={answers}
          signed={signed}
          compact={isCompact}
          onSelect={select}
          onSigned={() => setSigned(true)}
          onTimeChange={next =>
            setAnswers(current => ({ ...current, ...next }))
          }
          onContinue={() => goTo(screenIndex + 1)}
          onRestart={() => {
            setAnswers(initialAnswers);
            setSigned(false);
            goTo(0);
          }}
        />
      </Animated.View>
    </View>
  );
}

function WelcomeScreen({
  language,
  onLanguage,
  onStart,
}: {
  language: string;
  onLanguage: () => void;
  onStart: () => void;
}) {
  return (
    <View style={styles.welcome}>
      <View style={styles.welcomeTopRow}>
        <Pressable
          accessibilityLabel={`Language: ${language}`}
          onPress={onLanguage}
          style={styles.welcomeLanguage}
        >
          <Text style={styles.welcomeFlag}>🇺🇸</Text>
        </Pressable>
      </View>
      <View style={styles.welcomeCopy}>
        <Text style={styles.welcomeTitle}>
          Stop hitting snooze.{`\n`}Start winning{`\n`}mornings.
        </Text>
        <Text style={styles.welcomeSubtitle}>
          One alarm. One mission. You're up.
        </Text>
      </View>
      <View style={styles.rating}>
        <Text style={styles.laurels}>❧ ⭐️⭐️⭐️⭐️⭐️ ❧</Text>
        <Text style={styles.ratingScore}>4.8 out of 5</Text>
        <Text style={styles.ratingCount}>35,000+ App Store ratings</Text>
      </View>
      <View style={styles.welcomeFooter}>
        <PrimaryButton label="Build my plan   →" onPress={onStart} />
        <Text style={styles.socialProof}>
          Join 500k+ people waking up with Wayk
        </Text>
        <Text style={styles.accountLine}>
          Already have an account?{' '}
          <Text style={styles.accountAction}>Sign in</Text>
        </Text>
        <Text style={styles.accountLine}>
          Purchased on the web?{' '}
          <Text style={styles.accountAction}>Activate your account</Text>
        </Text>
      </View>
    </View>
  );
}

const LANGUAGES = [
  { name: 'English', flag: '🇺🇸' },
  { name: 'Français', flag: '🇫🇷' },
  { name: 'Deutsch', flag: '🇩🇪' },
  { name: 'Español', flag: '🇪🇸' },
  { name: 'Italiano', flag: '🇮🇹' },
  { name: '日本語', flag: '🇯🇵' },
];

function LanguageSheet({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (language: string) => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.languageSheet} onPress={() => undefined}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Pressable
              accessibilityLabel="Close language picker"
              onPress={onClose}
              style={styles.sheetClose}
            >
              <Text style={styles.sheetCloseText}>×</Text>
            </Pressable>
            <Text style={styles.sheetTitle}>Language</Text>
            <View style={styles.sheetHeaderSpace} />
          </View>
          {LANGUAGES.map(item => (
            <Pressable
              key={item.name}
              onPress={() => onSelect(item.name)}
              style={styles.languageRow}
            >
              <Text style={styles.languageRowFlag}>{item.flag}</Text>
              <Text style={styles.languageName}>{item.name}</Text>
              {selected === item.name ? (
                <View style={styles.languageCheck}>
                  <Text style={styles.languageCheckText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MorningIntroAnimation({ onComplete }: { onComplete: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 4300,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(1050),
    ]).start(onComplete);
  }, [onComplete, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.28, 0.58, 0.8, 1],
    outputRange: [
      colors.shade020513,
      colors.shade080B22,
      colors.shade65445F,
      colors.shadeD89D72,
      colors.shadeFAF8F1,
    ],
  });
  const starOpacity = progress.interpolate({
    inputRange: [0, 0.45, 0.72],
    outputRange: [1, 0.75, 0],
    extrapolate: 'clamp',
  });
  const sunTranslateY = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [height * 0.28, -height * 0.23, -height * 0.33],
  });
  const sunScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.56, 1.02, 1.12],
  });
  const glowOpacity = progress.interpolate({
    inputRange: [0, 0.45, 0.8, 1],
    outputRange: [0.34, 0.5, 0.3, 0.16],
  });
  const messageOpacity = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  const messageTranslateY = progress.interpolate({
    inputRange: [0.82, 1],
    outputRange: [25, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.morningIntro, { backgroundColor }]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: starOpacity }]}
      >
        {STAR_POSITIONS.map((star, index) => (
          <View
            key={`${star.left}-${star.top}`}
            style={[
              styles.star,
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.opacity,
              },
              index % 4 === 0 && styles.brightStar,
            ]}
          />
        ))}
      </Animated.View>
      <Animated.View
        style={[
          styles.risingSunWrap,
          { transform: [{ translateY: sunTranslateY }, { scale: sunScale }] },
        ]}
      >
        <Animated.View
          style={[styles.sunGlowLarge, { opacity: glowOpacity }]}
        />
        <Animated.View
          style={[styles.sunGlowSmall, { opacity: glowOpacity }]}
        />
        <View style={styles.risingSun}>
          <View style={styles.sunHighlight} />
        </View>
      </Animated.View>
      <Animated.Text
        style={[
          styles.morningMessage,
          {
            opacity: messageOpacity,
            transform: [{ translateY: messageTranslateY }],
          },
        ]}
      >
        Become a{`\n`}morning{`\n`}person
      </Animated.Text>
    </Animated.View>
  );
}

const STAR_POSITIONS = [
  { left: 11, top: 4, size: 5, opacity: 0.65 },
  { left: 35, top: 8, size: 4, opacity: 0.75 },
  { left: 50, top: 5, size: 8, opacity: 0.9 },
  { left: 63, top: 2, size: 3, opacity: 0.55 },
  { left: 20, top: 13, size: 11, opacity: 0.95 },
  { left: 45, top: 15, size: 6, opacity: 0.48 },
  { left: 79, top: 13, size: 5, opacity: 0.9 },
  { left: 7, top: 17, size: 5, opacity: 0.85 },
  { left: 76, top: 21, size: 10, opacity: 0.55 },
  { left: 55, top: 24, size: 5, opacity: 0.8 },
  { left: 22, top: 31, size: 5, opacity: 0.75 },
  { left: 89, top: 35, size: 5, opacity: 0.85 },
  { left: 89, top: 43, size: 10, opacity: 0.9 },
];

const SOUND_COLORS = [
  colors.shadeA9A9A9,
  colors.shade7789A5,
  colors.shade7DA32E,
  colors.shadeC96AD8,
  colors.shade19B697,
  colors.shadeEFC400,
  colors.shade8B79EE,
  colors.shadeFF6B5E,
];

function Screen({
  config,
  answers,
  signed,
  compact,
  onSelect,
  onSigned,
  onTimeChange,
  onContinue,
  onRestart,
}: {
  config: ScreenConfig;
  answers: Answers;
  signed: boolean;
  compact: boolean;
  onSelect: (key: ChoiceKey, value: string) => void;
  onSigned: () => void;
  onTimeChange: (next: Partial<Answers>) => void;
  onContinue: () => void;
  onRestart: () => void;
}) {
  if (config.kind === 'setupProgress') {
    return <SetupProgressScreen answers={answers} onComplete={onContinue} />;
  }

  if (config.kind === 'morningPlan') {
    return <MorningPlanScreen answers={answers} onContinue={onContinue} />;
  }

  if (config.kind === 'account') {
    return (
      <View style={styles.accountScreen}>
        <Text style={styles.accountTitle}>Create an account</Text>
        <Text style={styles.accountSubtitle}>
          Keep your alarms, streak, and badges safe.
        </Text>
        <Pressable onPress={onContinue} style={styles.appleButton}>
          <Text style={styles.appleButtonText}>● Sign in with Apple</Text>
        </Pressable>
        <Pressable onPress={onContinue} style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>
        <Pressable onPress={onContinue} hitSlop={16}>
          <Text style={styles.skipAccount}>Skip for now</Text>
        </Pressable>
      </View>
    );
  }

  if (config.kind === 'speedResult') {
    return <SpeedResultScreen onContinue={onContinue} />;
  }

  if (config.kind === 'notifications') {
    return (
      <FixedScreen button="Enable" secondary="Not now" onContinue={onContinue}>
        <View style={styles.notificationWrap}>
          <View style={styles.notificationGlow}>
            <Text style={styles.notificationBell}>🔔</Text>
          </View>
          <Text style={styles.notificationTitle}>Never miss your alarm</Text>
          <Text style={styles.notificationCopy}>
            Alarm alerts and reminders that keep your{`\n`}plan on track. Turn
            them off anytime.
          </Text>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'mission') {
    const missions = [
      ['Object Hunt', 'Photograph a random object', '▣'],
      ['Push Ups', '15 seconds of push-ups', '⌁'],
      ['Squats', '15 seconds of squats', '♟'],
      ['Math Problem', 'Solve math problems', '√x'],
      ['Sky Photo', 'Photograph the morning sky', '☁'],
      ['Make Your Bed', 'Show a made bed', '▰'],
    ];
    return (
      <FixedScreen
        button="Continue"
        disabled={!answers.mission}
        onContinue={onContinue}
        compact={compact}
      >
        <Text style={styles.title}>Choose your wake{`\n`}up mission</Text>
        <Text style={styles.subtitle}>
          You'll do this to turn off your alarm.
        </Text>
        <View style={styles.missionList}>
          {missions.map(([name, description, icon]) => (
            <Pressable
              key={name}
              onPress={() => onSelect('mission', name)}
              style={[
                styles.missionCard,
                answers.mission === name && styles.missionCardSelected,
              ]}
            >
              <View style={styles.missionIcon}>
                <Text style={styles.missionIconText}>{icon}</Text>
              </View>
              <View style={styles.missionCopy}>
                <Text style={styles.missionName}>{name}</Text>
                <Text style={styles.missionDescription}>{description}</Text>
              </View>
              <View
                style={[
                  styles.missionRadio,
                  answers.mission === name && styles.missionRadioSelected,
                ]}
              >
                {answers.mission === name ? (
                  <Text style={styles.missionCheck}>✓</Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'missionSetup') {
    const mission = answers.mission ?? 'Push Ups';
    const amount = answers.missionAmount ?? 15;
    return (
      <FixedScreen button="Continue" onContinue={onContinue}>
        <Text style={styles.title}>Set up your {mission.toLowerCase()}</Text>
        <Text style={styles.subtitle}>
          You can change this anytime in settings.
        </Text>
        <View style={styles.segmented}>
          <Pressable
            onPress={() => onTimeChange({ missionUnit: 'Time' })}
            style={[
              styles.segmentTab,
              answers.missionUnit === 'Time' && styles.segmentTabActive,
            ]}
          >
            <Text style={styles.segmentText}>Time</Text>
          </Pressable>
          <Pressable
            onPress={() => onTimeChange({ missionUnit: 'Reps' })}
            style={[
              styles.segmentTab,
              answers.missionUnit === 'Reps' && styles.segmentTabActive,
            ]}
          >
            <Text style={styles.segmentText}>Reps</Text>
          </Pressable>
        </View>
        <View style={styles.amountCard}>
          <Pressable
            onPress={() =>
              onTimeChange({ missionAmount: Math.max(5, amount - 5) })
            }
            style={styles.amountButton}
          >
            <Text style={styles.amountButtonText}>−</Text>
          </Pressable>
          <View>
            <Text style={styles.amountValue}>{amount}</Text>
            <Text style={styles.amountUnit}>
              {answers.missionUnit === 'Reps' ? 'reps' : 'seconds'}
            </Text>
          </View>
          <Pressable
            onPress={() => onTimeChange({ missionAmount: amount + 5 })}
            style={styles.amountButton}
          >
            <Text style={styles.amountButtonText}>+</Text>
          </Pressable>
          <Text style={styles.amountHelp}>
            Do {mission.toLowerCase()} for {amount}{' '}
            {answers.missionUnit === 'Reps' ? 'reps' : 'seconds'} to turn off
            {`\n`}your alarm.
          </Text>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'missionWhy') {
    const mission = answers.mission ?? 'Push Ups';
    return (
      <FixedScreen button="Continue" onContinue={onContinue}>
        <Text style={styles.title}>
          Why doing {mission.toLowerCase()} wakes{`\n`}you up
        </Text>
        <View style={styles.whyWrap}>
          <Text style={styles.exerciseSun}>☀️</Text>
          <Text style={styles.whyTitle}>
            Gets your blood pumping right away
          </Text>
          <Text style={styles.whyCopy}>
            Short bursts of effort spike cortisol and{`\n`}adrenaline, raising
            heart rate and body{`\n`}temperature so you feel awake fast.
          </Text>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'firstWayk') {
    return (
      <FixedScreen
        button={`Set alarm for ${formatTime(answers)}`}
        onContinue={onContinue}
      >
        <Text style={styles.title}>Set your first Wayk time</Text>
        <Text style={styles.subtitle}>
          We'll wake you at {formatTime(answers)} with your mission.
        </Text>
        <TimeWheel
          hour={answers.hour}
          minute={answers.minute}
          period={answers.period}
          onChange={onTimeChange}
        />
      </FixedScreen>
    );
  }

  if (config.kind === 'days') {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const selectedDays = answers.days ?? [];
    return (
      <FixedScreen
        button="Continue"
        disabled={!selectedDays.length}
        onContinue={onContinue}
        compact={compact}
      >
        <Text style={styles.title}>Which days should{`\n`}Wayk ring?</Text>
        <Text style={styles.subtitle}>Pick the days you want to lock in.</Text>
        <View style={styles.choices}>
          {days.map(day => (
            <ChoiceCard
              key={day}
              label={day}
              selected={selectedDays.includes(day)}
              onPress={() =>
                onTimeChange({
                  days: selectedDays.includes(day)
                    ? selectedDays.filter(item => item !== day)
                    : [...selectedDays, day],
                })
              }
            />
          ))}
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'sound') {
    const sounds = [
      ['CLASSIC', 'Default', '🔔'],
      ['CLASSIC', 'Alarm Clock', '●'],
      ['CLASSIC', 'Reveille', '●'],
      ['CLASSIC', 'Sparkles', '●'],
      ['VIRAL', 'Mindful Earth', '●'],
      ['VIRAL', 'Epic Brass', '●'],
      ['VIRAL', 'Neon', '●'],
      ['VIRAL', 'Dialed', '●'],
    ];
    return (
      <FixedScreen
        button="Continue"
        disabled={!answers.alarmSound}
        onContinue={onContinue}
        compact
      >
        <Text style={styles.title}>Pick your alarm sound</Text>
        <View style={styles.soundList}>
          {sounds.map(([group, name, icon], index) => (
            <React.Fragment key={name}>
              {index === 0 || sounds[index - 1][0] !== group ? (
                <Text style={styles.soundGroup}>
                  {group === 'CLASSIC' ? '🔔' : '🔥'} {group}
                </Text>
              ) : null}
              <Pressable
                onPress={() => onSelect('alarmSound', name)}
                style={styles.soundRow}
              >
                <Text style={[styles.soundOrb, { color: SOUND_COLORS[index] }]}>
                  {icon}
                </Text>
                <Text style={styles.soundName}>{name}</Text>
                {name !== 'Default' ? <Text style={styles.play}>▶</Text> : null}
                <View
                  style={[
                    styles.missionRadio,
                    answers.alarmSound === name && styles.missionRadioSelected,
                  ]}
                >
                  {answers.alarmSound === name ? (
                    <Text style={styles.missionCheck}>✓</Text>
                  ) : null}
                </View>
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'referral') {
    return (
      <FixedScreen button="Continue" onContinue={onContinue}>
        <Text style={styles.title}>Enter referral code{`\n`}(optional)</Text>
        <Text style={styles.subtitle}>
          Have a friend's code? You'll both get credit.
        </Text>
        <View style={styles.referralRow}>
          <TextInput
            placeholder="Referral Code"
            placeholderTextColor={colors.shadeC9C9C5}
            value={answers.referralCode}
            onChangeText={referralCode => onTimeChange({ referralCode })}
            style={styles.referralInput}
          />
          <Pressable
            style={[
              styles.referralSubmit,
              !answers.referralCode && styles.referralSubmitDisabled,
            ]}
          >
            <Text style={styles.referralSubmitText}>Submit</Text>
          </Pressable>
        </View>
      </FixedScreen>
    );
  }
  if (config.kind === 'quote') {
    return (
      <FixedScreen button="Continue" onContinue={onContinue}>
        <View style={styles.quoteWrap}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quote}>
            If you win{`\n`}the morning,{`\n`}you win the day.
          </Text>
          <Text style={styles.author}>— Tim Ferriss</Text>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'comparison') {
    return <ComparisonScreen onContinue={onContinue} />;
  }

  if (config.kind === 'biology') {
    return (
      <FixedScreen button="Continue" onContinue={onContinue}>
        <View style={styles.biologyWrap}>
          <View style={styles.dnaGlow}>
            <Text style={styles.dnaIcon}>🧬</Text>
          </View>
          <Text style={[styles.title, styles.center]}>
            Biology, Not Laziness
          </Text>
          <Text style={styles.biologyCopy}>
            When the alarm rings, your prefrontal{`\n`}
            cortex is still asleep. This is 'Sleep Inertia.'{`\n`}
            You can't think your way out of bed when{`\n`}
            your brain is offline.
          </Text>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'target') {
    return (
      <FixedScreen button="Continue" onContinue={onContinue}>
        <View style={styles.targetWrap}>
          <Text style={styles.targetTitle}>
            Waking up at {formatTime(answers)} is{`\n`}your target.
          </Text>
          <Text style={styles.targetGain}>+15 minutes every morning</Text>
          <Text style={styles.targetMonth}>+7 hours this month</Text>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'commitment') {
    return (
      <FixedScreen
        button="Continue"
        disabled={!signed}
        onContinue={onContinue}
        scrollEnabled={false}
      >
        <View>
          <Text style={[styles.title, styles.center]}>
            Lock in your{`\n`}commitment
          </Text>
          <Text style={[styles.subtitle, styles.center]}>
            Sign below to put the phone down and get up at {formatTime(answers)}
            .
          </Text>
          <View style={styles.signatureWrap}>
            <SignaturePad onSigned={onSigned} />
          </View>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'unlock') {
    return (
      <FixedScreen
        button="Text One Friend"
        onContinue={onContinue}
        secondary="Skip"
      >
        <View style={styles.unlockWrap}>
          <View style={styles.unlockIcon}>
            <View style={styles.unlockDisc}>
              <Text style={styles.lock}>🔒</Text>
            </View>
          </View>
          <Text style={[styles.title, styles.center]}>
            Unlock an exclusive{`\n`}alarm sound
          </Text>
          <Text style={[styles.subtitle, styles.center]}>
            Know someone who sleeps through{`\n`}their alarms? Refer a friend
            and this{`\n`}alarm sound is yours.{`\n\n`}We'll write the text for
            you. Just pick one friend.{`\n`}No spam, no catch.
          </Text>
        </View>
      </FixedScreen>
    );
  }

  if (config.kind === 'complete') {
    return (
      <View style={styles.complete}>
        <View style={styles.completeMark}>
          <Text style={styles.completeCheck}>✓</Text>
        </View>
        <Text style={[styles.title, styles.center]}>
          Your first Wayk is set
        </Text>
        <Text style={[styles.subtitle, styles.center]}>
          We'll see you at {formatTime(answers)}. Get ready to win your morning.
        </Text>
        <View style={styles.summary}>
          <Text style={styles.summaryTime}>{formatTime(answers)}</Text>
          <Text style={styles.summaryLabel}>Tomorrow morning</Text>
        </View>
        <PrimaryButton label="Review onboarding" onPress={onRestart} />
      </View>
    );
  }

  const selected = config.answerKey ? answers[config.answerKey] : undefined;
  const disabled = config.kind === 'choice' && !selected;
  const buttonLabel = 'Continue';

  return (
    <FixedScreen
      button={buttonLabel}
      disabled={disabled}
      onContinue={onContinue}
      compact={compact}
    >
      <View>
        <Text style={styles.title}>{config.title}</Text>
        {config.subtitle ? (
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        ) : null}
        {config.kind === 'intro' ? <HeroIllustration /> : null}
        {config.kind === 'energy' ? <EnergyChart /> : null}
        {config.kind === 'choice' ? (
          <View style={styles.choices}>
            {config.options?.map(option => (
              <ChoiceCard
                key={option.label}
                label={option.label}
                icon={option.icon}
                selected={selected === option.label}
                onPress={() => onSelect(config.answerKey!, option.label)}
              />
            ))}
          </View>
        ) : null}
        {config.kind === 'time' ? (
          <TimeWheel
            hour={
              config.timeField === 'bedtime'
                ? answers.bedtimeHour
                : answers.hour
            }
            minute={
              config.timeField === 'bedtime'
                ? answers.bedtimeMinute
                : answers.minute
            }
            period={
              config.timeField === 'bedtime'
                ? answers.bedtimePeriod
                : answers.period
            }
            onChange={next => {
              if (config.timeField === 'bedtime') {
                onTimeChange({
                  bedtimeHour: next.hour ?? answers.bedtimeHour,
                  bedtimeMinute: next.minute ?? answers.bedtimeMinute,
                  bedtimePeriod: next.period ?? answers.bedtimePeriod,
                });
              } else {
                onTimeChange(next);
              }
            }}
          />
        ) : null}
      </View>
    </FixedScreen>
  );
}

function SpeedResultScreen({ onContinue }: { onContinue: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [multiplier, setMultiplier] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const listener = progress.addListener(({ value }) =>
      setMultiplier(1 + value * 4),
    );
    Animated.timing(progress, {
      toValue: 1,
      duration: 1900,
      delay: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished: didFinish }) => setFinished(didFinish));
    return () => progress.removeListener(listener);
  }, [progress]);

  const needleRotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-82deg', '82deg'],
  });

  return (
    <FixedScreen button="Continue" disabled={!finished} onContinue={onContinue}>
      <Text style={styles.title}>Get out of bed 5x faster{`\n`}with Wayk</Text>
      <View style={styles.speedCard}>
        <View style={styles.gaugeViewport}>
          <View style={styles.gaugeArc} />
          <View style={styles.gaugeInnerMask} />
          <Animated.View
            style={[
              styles.gaugeNeedle,
              { transform: [{ rotate: needleRotation }] },
            ]}
          />
          <View style={styles.gaugePin} />
          <Text style={styles.speedValue}>{multiplier.toFixed(1)}x</Text>
          <Text style={styles.fasterLabel}>F A S T E R</Text>
        </View>
        <View style={styles.speedEnds}>
          <View>
            <Text style={styles.slowLabel}>Slow</Text>
            <Text style={styles.endSub}>Groggy</Text>
          </View>
          <View>
            <Text style={styles.instantLabel}>Instant</Text>
            <Text style={[styles.endSub, styles.endSubRight]}>Active</Text>
          </View>
        </View>
        {finished ? (
          <Text style={styles.speedDescription}>
            Wayk eliminates snoozing for{`\n`}instant wake ups.
          </Text>
        ) : null}
      </View>
    </FixedScreen>
  );
}

function SetupProgressScreen({
  answers,
  onComplete,
}: {
  answers: Answers;
  onComplete: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const listener = progress.addListener(({ value }) =>
      setPercentage(Math.round(value * 100)),
    );
    Animated.timing(progress, {
      toValue: 1,
      duration: 4300,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setTimeout(onComplete, 750);
      }
    });
    return () => progress.removeListener(listener);
  }, [onComplete, progress]);

  const rows = [
    ['Configuring your goals', 'Morning routine ready'],
    ['Setting your mission', `${answers.mission ?? 'Push Ups'} selected`],
    ['Setting alarm tone', `${answers.alarmSound ?? 'Default'} locked in`],
    ['Scheduling your alarm', `Set for ${formatTime(answers)}`],
    ['Setting up wake receipt', 'Sunrise ready'],
  ];
  const activeIndex = Math.min(4, Math.floor(percentage / 20));
  const status =
    percentage === 100 ? 'All done!' : `${rows[activeIndex][0]}...`;

  return (
    <View style={styles.setupScreen}>
      <Text style={styles.setupPercent}>{percentage}%</Text>
      <Text style={styles.setupTitle}>
        {percentage === 100
          ? "You're all set"
          : `Setting everything up\nfor you`}
      </Text>
      <View style={styles.setupTrack}>
        <View
          style={[
            styles.setupFill,
            { width: `${percentage}%` },
            percentage === 100 && styles.setupFillDone,
          ]}
        />
      </View>
      <Text style={styles.setupStatus}>{status}</Text>
      <View style={styles.setupCard}>
        {rows.map((row, index) => {
          const complete = percentage === 100 || percentage >= (index + 1) * 20;
          const active = index === activeIndex && percentage < 100;
          return (
            <View key={row[0]} style={styles.setupRow}>
              <View style={styles.setupRowCopy}>
                <Text
                  style={[
                    styles.setupRowTitle,
                    !complete && !active && styles.setupRowMuted,
                  ]}
                >
                  {row[0]}
                </Text>
                {complete ? (
                  <Text style={styles.setupRowSubtitle}>{row[1]}</Text>
                ) : null}
              </View>
              <View
                style={[styles.setupCheck, complete && styles.setupCheckDone]}
              >
                {complete ? <Text style={styles.setupCheckText}>✓</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MorningPlanScreen({
  answers,
  onContinue,
}: {
  answers: Answers;
  onContinue: () => void;
}) {
  const selectedDays = answers.days ?? [];
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <View style={styles.planScreen}>
      <ScrollView
        contentContainerStyle={styles.planContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.planStars}>❧ ⭐️⭐️⭐️⭐️⭐️ ❧</Text>
        <Text style={styles.planTitle}>Your Morning Plan</Text>
        <Text style={styles.planSubtitle}>
          Here's what today looks like at {formatTime(answers)}
        </Text>
        <View style={styles.planPills}>
          <Text style={styles.planPill}>⏱ Starts tomorrow</Text>
          <Text style={styles.planPill}>⚡ {formatTime(answers)}</Text>
          <Text style={styles.planPill}>⌁ {answers.mission ?? 'Push Ups'}</Text>
          <Text style={styles.planPill}>
            🔔 {answers.alarmSound ?? 'Default'}
          </Text>
        </View>
        <View style={styles.todayCard}>
          <Text style={styles.sectionEyebrow}>HERE'S TODAY</Text>
          <PlanStep icon="🔔" text={`${formatTime(answers)} — Alarm rings`} />
          <PlanStep
            icon="⌁"
            text={`Complete ${answers.mission ?? 'Push Ups'}`}
          />
          <PlanStep icon="✓" text="You're up. Day started." success />
          <Text style={styles.todayCopy}>
            No snooze loops. One action, then your{`\n`}day starts with
            momentum.
          </Text>
        </View>
        <Text style={styles.downChevron}>⌄</Text>
        <Text style={styles.sectionEyebrowCenter}>YOUR WAKE RECEIPT</Text>
        <View style={styles.receiptCard}>
          <Text style={styles.receiptDate}>AUG 14</Text>
          <Text style={styles.receiptScene}>🏔️ 🎣☀️</Text>
          <Text style={styles.receiptTime}>{formatTime(answers)}</Text>
          <Text style={styles.receiptMission}>
            {answers.mission ?? 'Push-Ups'}
          </Text>
        </View>
        <Text style={styles.downChevron}>⌄</Text>
        <View style={styles.repeatCard}>
          <Text style={styles.repeatTitle}>Rise and repeat.</Text>
          <Text style={styles.repeatCopy}>
            Your alarm fires {selectedDays.length || 7}x a week. Build{`\n`}the
            streak.
          </Text>
          <View style={styles.dayCircles}>
            {dayLetters.map((letter, index) => (
              <View key={`${letter}-${index}`} style={styles.dayCircle}>
                <Text style={styles.dayLetter}>{letter}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.downChevron}>⌄</Text>
        <Text style={styles.sectionEyebrowCenter}>OTHERS LIKE YOU</Text>
        <Testimonial
          name="Sarah M."
          copy="I used to hit snooze for an hour every morning. Now I'm up on my first alarm."
        />
        <Testimonial
          name="James R."
          copy="The mission feature is genius. One small task starts my day."
        />
        <View style={styles.planBottomSpace} />
      </ScrollView>
      <View style={styles.planFooter}>
        <PrimaryButton label="Start my plan" onPress={onContinue} />
      </View>
    </View>
  );
}

function PlanStep({
  icon,
  text,
  success,
}: {
  icon: string;
  text: string;
  success?: boolean;
}) {
  return (
    <View style={styles.planStep}>
      <View style={[styles.planStepIcon, success && styles.planStepSuccess]}>
        <Text style={styles.planStepIconText}>{icon}</Text>
      </View>
      <Text style={styles.planStepText}>{text}</Text>
    </View>
  );
}

function Testimonial({ name, copy }: { name: string; copy: string }) {
  return (
    <View style={styles.testimonial}>
      <View style={styles.avatar}>
        <Text>☺</Text>
      </View>
      <View style={styles.testimonialCopy}>
        <View style={styles.testimonialTop}>
          <Text style={styles.testimonialName}>{name}</Text>
          <Text style={styles.testimonialStars}>★★★★★ 5.0</Text>
        </View>
        <Text style={styles.testimonialQuote}>“{copy}”</Text>
      </View>
    </View>
  );
}

function ComparisonScreen({ onContinue }: { onContinue: () => void }) {
  const animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [animation]);
  const reveal = (start: number, end: number) =>
    animation.interpolate({
      inputRange: [start, end],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  return (
    <FixedScreen button="Continue" onContinue={onContinue}>
      <Text style={styles.title}>One alarm. One mission.</Text>
      <View style={styles.comparisonCardNew}>
        <View style={styles.timelineSide}>
          <Text style={styles.comparisonHeadingNew}>TYPICAL MORNING</Text>
          <TimelineConnector
            style={styles.leftLineOne}
            color={colors.shadeF3C744}
            progress={reveal(0.05, 0.22)}
          />
          <TimelineConnector
            style={styles.leftLineTwo}
            color={colors.shadeEE9943}
            progress={reveal(0.22, 0.4)}
          />
          <TimelineConnector
            style={styles.leftLineThree}
            color={colors.shadeEE5961}
            progress={reveal(0.4, 0.58)}
          />
          <TimelineEvent
            top={48}
            left={17}
            icon="🔔"
            time="7:00"
            label="Alarm"
            opacity={reveal(0, 0.08)}
          />
          <TimelineEvent
            top={136}
            left={42}
            icon="💤"
            time="7:09"
            label="Snooze"
            opacity={reveal(0.18, 0.26)}
          />
          <TimelineEvent
            top={224}
            left={12}
            icon="💤"
            time="7:18"
            label="Snooze"
            opacity={reveal(0.36, 0.44)}
          />
          <TimelineEvent
            top={312}
            left={40}
            icon="⚠️"
            time="7:27"
            label="Panic"
            opacity={reveal(0.54, 0.62)}
          />
        </View>
        <View style={styles.comparisonDividerNew} />
        <View style={styles.timelineSide}>
          <Text style={[styles.comparisonHeadingNew, styles.waykHeading]}>
            WAYK MORNING
          </Text>
          <Animated.View
            style={[
              styles.waykTimelineLine,
              { transform: [{ scaleY: reveal(0.62, 0.88) }] },
            ]}
          />
          <TimelineEvent
            top={48}
            left={12}
            icon="🔔"
            time="7:00"
            label="Alarm"
            opacity={reveal(0.6, 0.68)}
            accent
          />
          <TimelineEvent
            top={130}
            left={12}
            icon="✓"
            time="7:01"
            label="Mission"
            opacity={reveal(0.7, 0.77)}
            accent
          />
          <TimelineEvent
            top={212}
            left={12}
            icon="☀️"
            time="7:02"
            label="Started"
            opacity={reveal(0.79, 0.86)}
            accent
          />
          <Animated.View
            style={[
              styles.gainedBadgeNew,
              {
                opacity: reveal(0.88, 1),
                transform: [{ scale: reveal(0.88, 1) }],
              },
            ]}
          >
            <Text style={styles.gainedValue}>25 MINS</Text>
            <Text style={styles.gainedLabel}>GAINED</Text>
          </Animated.View>
        </View>
      </View>
    </FixedScreen>
  );
}

function TimelineConnector({
  style,
  color,
  progress,
}: {
  style: object;
  color: string;
  progress: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <Animated.View
      style={[
        styles.timelineConnector,
        style,
        {
          backgroundColor: color,
          opacity: progress,
          transform: [{ scaleY: progress }],
        },
      ]}
    />
  );
}

function TimelineEvent({
  top,
  left,
  icon,
  time,
  label,
  opacity,
  accent,
}: {
  top: number;
  left: number;
  icon: string;
  time: string;
  label: string;
  opacity: Animated.AnimatedInterpolation<number>;
  accent?: boolean;
}) {
  return (
    <Animated.View style={[styles.timelineEvent, { top, left, opacity }]}>
      <View style={[styles.timelineIcon, accent && styles.timelineIconAccent]}>
        <Text style={styles.timelineEmoji}>{icon}</Text>
      </View>
      <View style={styles.timelineText}>
        <Text style={styles.timelineTime}>{time}</Text>
        <Text style={styles.timelineLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function FixedScreen({
  children,
  button,
  disabled,
  onContinue,
  secondary,
  compact,
  scrollEnabled = true,
}: {
  children: React.ReactNode;
  button: string;
  disabled?: boolean;
  onContinue: () => void;
  secondary?: string;
  compact?: boolean;
  scrollEnabled?: boolean;
}) {
  return (
    <View style={styles.fixed}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          compact && styles.contentCompact,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={button}
          disabled={disabled}
          onPress={onContinue}
        />
        {secondary ? (
          <Pressable onPress={onContinue} hitSlop={10}>
            <Text style={styles.secondary}>{secondary}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function HeroIllustration() {
  return (
    <View style={styles.hero}>
      <View style={styles.sun} />
      <View style={styles.phone}>
        <View style={styles.phoneSpeaker} />
        <Text style={styles.phoneTime}>7:30</Text>
        <Text style={styles.phoneLabel}>TIME TO WAYK</Text>
        <View style={styles.phoneButton}>
          <Text style={styles.phoneButtonText}>I'm up</Text>
        </View>
      </View>
      <View style={styles.heroLine} />
    </View>
  );
}

function formatTime(answers: Answers) {
  return `${answers.hour}:${answers.minute.toString().padStart(2, '0')} ${
    answers.period
  }`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  animated: { flex: 1 },
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: scale(42),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: scale(-2),
  },
  logoRing: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: colors.text,
    left: -5,
    top: -19,
  },
  fixed: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: layout.horizontal,
    paddingTop: 18,
    paddingBottom: 28,
    flexGrow: 1,
  },
  contentCompact: { paddingTop: 8 },
  footer: { paddingHorizontal: layout.horizontal, paddingBottom: 14, gap: 10 },
  title: {
    fontSize: scale(31),
    lineHeight: scale(35),
    letterSpacing: scale(-1.1),
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: scale(14),
    lineHeight: scale(20),
    color: colors.muted,
    marginTop: 8,
  },
  center: { textAlign: 'center' },
  choices: { gap: 10, marginTop: 24 },
  quoteWrap: {
    flex: 1,
    minHeight: 430,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteMark: {
    fontSize: scale(68),
    lineHeight: scale(58),
    color: colors.shadeDFDFDA,
    fontFamily: 'Georgia',
  },
  quote: {
    fontSize: scale(32),
    lineHeight: scale(35),
    textAlign: 'center',
    color: colors.text,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  author: { fontSize: scale(13), color: colors.muted, marginTop: 18 },
  signatureWrap: { marginTop: 34 },
  unlockWrap: { alignItems: 'center', paddingTop: 38 },
  unlockIcon: {
    width: 150,
    height: 150,
    borderRadius: 38,
    backgroundColor: colors.shadeEF8974,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 42,
    shadowColor: colors.coral,
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
  unlockDisc: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.shadeFFF6DC,
    borderWidth: 5,
    borderColor: colors.shadeF2D8AB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: { fontSize: scale(35) },
  secondary: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: scale(13),
    fontWeight: '600',
  },
  complete: {
    flex: 1,
    paddingHorizontal: layout.horizontal,
    maxWidth: layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  completeMark: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  completeCheck: {
    fontSize: scale(40),
    color: colors.surface,
    fontWeight: '800',
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    alignItems: 'center',
    padding: 28,
    marginVertical: 10,
  },
  summaryTime: { fontSize: scale(40), fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: scale(13), color: colors.muted, marginTop: 5 },
  hero: {
    height: 350,
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.shadeF7DDAF,
    opacity: 0.7,
    top: 40,
  },
  heroLine: {
    position: 'absolute',
    height: 3,
    width: 250,
    backgroundColor: colors.peach,
    bottom: 34,
    borderRadius: 2,
  },
  phone: {
    width: 158,
    height: 300,
    borderRadius: 28,
    borderWidth: 7,
    borderColor: colors.text,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingTop: 45,
    transform: [{ rotate: '-4deg' }],
    shadowColor: colors.shade111,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  phoneSpeaker: {
    position: 'absolute',
    top: 12,
    width: 54,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.text,
  },
  phoneTime: { fontSize: scale(38), fontWeight: '800', color: colors.text },
  phoneLabel: {
    fontSize: scale(9),
    fontWeight: '700',
    color: colors.muted,
    marginTop: 5,
    letterSpacing: scale(0.7),
  },
  phoneButton: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: colors.text,
    borderRadius: 18,
    width: 105,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneButtonText: {
    fontSize: scale(12),
    color: colors.surface,
    fontWeight: '700',
  },
  morningIntro: { flex: 1, overflow: 'hidden', alignItems: 'center' },
  star: {
    position: 'absolute',
    backgroundColor: colors.surface,
    shadowColor: colors.surface,
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  brightStar: { shadowOpacity: 1, shadowRadius: 9 },
  risingSunWrap: {
    position: 'absolute',
    top: '50%',
    width: 118,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunGlowLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.shadeF5A800,
  },
  sunGlowSmall: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: colors.shadeFFC21A,
  },
  risingSun: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.shadeFFB816,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadeFFB000,
    shadowOpacity: 0.9,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  sunHighlight: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: colors.shadeFFF7CF,
    opacity: 0.92,
    shadowColor: colors.surface,
    shadowOpacity: 1,
    shadowRadius: 13,
  },
  morningMessage: {
    position: 'absolute',
    top: '36%',
    width: '88%',
    textAlign: 'center',
    fontSize: scale(55),
    lineHeight: scale(61),
    letterSpacing: scale(-2.4),
    fontWeight: '900',
    color: colors.shade171925,
  },
  welcome: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 54,
  },
  welcomeTopRow: { height: 54, alignItems: 'flex-end' },
  welcomeLanguage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.shadeF0F0EE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeFlag: { fontSize: scale(24) },
  welcomeCopy: { marginTop: 22 },
  welcomeTitle: {
    fontSize: scale(43),
    lineHeight: scale(49),
    letterSpacing: scale(-1.8),
    fontWeight: '900',
    color: colors.text,
  },
  welcomeSubtitle: {
    fontSize: scale(17),
    lineHeight: scale(24),
    color: colors.muted,
    marginTop: 18,
  },
  rating: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laurels: {
    fontSize: scale(25),
    letterSpacing: scale(1),
    color: colors.shadeB79A2D,
  },
  ratingScore: {
    fontSize: scale(22),
    fontWeight: '800',
    color: colors.text,
    marginTop: 7,
  },
  ratingCount: { fontSize: scale(15), color: colors.muted, marginTop: 6 },
  welcomeFooter: { paddingBottom: 18, gap: 12 },
  socialProof: {
    textAlign: 'center',
    fontSize: scale(14),
    color: colors.muted,
    marginTop: 2,
  },
  accountLine: {
    textAlign: 'center',
    fontSize: scale(13),
    color: colors.shadeA2A29D,
  },
  accountAction: { color: colors.text, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
    justifyContent: 'flex-end',
  },
  languageSheet: {
    backgroundColor: colors.shadeFAFAFA,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.shadeD1D1D1,
    alignSelf: 'center',
  },
  sheetHeader: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetClose: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.shadeE8E8E8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseText: {
    fontSize: scale(32),
    lineHeight: scale(35),
    color: colors.shade555,
    fontWeight: '300',
  },
  sheetTitle: { fontSize: scale(20), color: colors.text, fontWeight: '800' },
  sheetHeaderSpace: { width: 48 },
  languageRow: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.shadeE5E5E5,
  },
  languageRowFlag: { fontSize: scale(28), width: 54 },
  languageName: {
    flex: 1,
    fontSize: scale(22),
    color: colors.text,
    fontWeight: '500',
  },
  languageCheck: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.shade30CE72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageCheckText: {
    color: colors.surface,
    fontWeight: '900',
    fontSize: scale(22),
  },
  comparisonCard: {
    marginTop: 28,
    minHeight: 440,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    flexDirection: 'row',
    shadowColor: colors.shade171711,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  comparisonColumn: { flex: 1 },
  comparisonDivider: {
    width: 1,
    marginHorizontal: 10,
    backgroundColor: colors.shadeECECE8,
  },
  comparisonHeading: {
    fontSize: scale(9),
    letterSpacing: scale(0.6),
    color: colors.shadeA0A09A,
    fontWeight: '800',
    marginBottom: 14,
  },
  waykHeading: { color: colors.green },
  comparisonItem: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  comparisonIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.shadeFFF1CC,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonIconAccent: { backgroundColor: colors.shadeE4F8EC },
  comparisonEmoji: { fontSize: scale(15) },
  comparisonTime: {
    fontSize: scale(14),
    fontWeight: '800',
    color: colors.text,
  },
  comparisonLabel: { fontSize: scale(11), color: colors.muted, marginTop: 2 },
  typicalPathOne: {
    position: 'absolute',
    left: 28,
    top: 66,
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.shadeF2C443,
    transform: [{ rotate: '72deg' }],
  },
  typicalPathTwo: {
    position: 'absolute',
    left: 24,
    top: 142,
    width: 61,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.shadeEE9647,
    transform: [{ rotate: '-56deg' }],
  },
  typicalPathThree: {
    position: 'absolute',
    left: 29,
    top: 218,
    width: 65,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.shadeED5A61,
    transform: [{ rotate: '65deg' }],
  },
  waykPath: {
    position: 'absolute',
    left: 16,
    top: 55,
    width: 4,
    height: 245,
    borderRadius: 2,
    backgroundColor: colors.shade26BD91,
  },
  gainedBadge: {
    height: 82,
    borderRadius: 16,
    backgroundColor: colors.shadeE2F7F0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  gainedValue: {
    fontSize: scale(22),
    color: colors.shade16A986,
    fontWeight: '900',
  },
  gainedLabel: {
    fontSize: scale(11),
    color: colors.shade46AF94,
    letterSpacing: scale(1.5),
    fontWeight: '800',
    marginTop: 4,
  },
  biologyWrap: {
    flex: 1,
    minHeight: 530,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  dnaGlow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    backgroundColor: colors.shadeF5FBFB,
    shadowColor: colors.shade2AC7CF,
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  dnaIcon: { fontSize: scale(104) },
  biologyCopy: {
    marginTop: 22,
    fontSize: scale(16),
    lineHeight: scale(25),
    color: colors.muted,
    textAlign: 'center',
  },
  targetWrap: {
    flex: 1,
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  targetTitle: {
    fontSize: scale(31),
    lineHeight: scale(37),
    letterSpacing: scale(-1),
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  targetGain: {
    fontSize: scale(21),
    lineHeight: scale(28),
    fontWeight: '800',
    color: colors.shade34CC76,
    marginTop: 28,
  },
  targetMonth: {
    fontSize: scale(18),
    lineHeight: scale(25),
    color: colors.shade666660,
    marginTop: 8,
  },
  comparisonCardNew: {
    marginTop: 28,
    height: 475,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    shadowColor: colors.shade171711,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  timelineSide: { flex: 1, position: 'relative' },
  comparisonDividerNew: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.shadeE7E7E3,
    marginHorizontal: 5,
  },
  comparisonHeadingNew: {
    fontSize: scale(10),
    letterSpacing: scale(0.8),
    color: colors.shade999994,
    fontWeight: '800',
    textAlign: 'center',
  },
  timelineConnector: {
    position: 'absolute',
    width: 5,
    borderRadius: 3,
    zIndex: 0,
  },
  leftLineOne: {
    left: 56,
    top: 100,
    height: 70,
    transform: [{ rotate: '-22deg' }],
  },
  leftLineTwo: {
    left: 55,
    top: 188,
    height: 68,
    transform: [{ rotate: '24deg' }],
  },
  leftLineThree: {
    left: 55,
    top: 276,
    height: 68,
    transform: [{ rotate: '-23deg' }],
  },
  timelineEvent: {
    position: 'absolute',
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.shadeFFF3CA,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadeEEC85F,
    shadowOpacity: 0.13,
    shadowRadius: 9,
  },
  timelineIconAccent: {
    backgroundColor: colors.shadeE5F8F0,
    shadowColor: colors.shade24BE92,
  },
  timelineEmoji: { fontSize: scale(19) },
  timelineText: { marginLeft: 10, width: 64 },
  timelineTime: { fontSize: scale(15), fontWeight: '900', color: colors.text },
  timelineLabel: { fontSize: scale(12), color: colors.muted, marginTop: 2 },
  waykTimelineLine: {
    position: 'absolute',
    left: 34,
    top: 90,
    width: 5,
    height: 270,
    borderRadius: 3,
    backgroundColor: colors.shade24BB8D,
    zIndex: 0,
  },
  gainedBadgeNew: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 320,
    height: 91,
    borderRadius: 18,
    backgroundColor: colors.shadeE1F6EF,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  missionList: { marginTop: 22, gap: 8 },
  missionCard: {
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.transparent,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionCardSelected: { borderColor: colors.shade11110F },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.shadeF7F5FC,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  missionIconText: {
    fontSize: scale(19),
    color: colors.shade8174B9,
    fontWeight: '800',
  },
  missionCopy: { flex: 1 },
  missionName: {
    fontSize: scale(18),
    lineHeight: scale(23),
    fontWeight: '600',
    color: colors.text,
  },
  missionDescription: {
    fontSize: scale(13),
    lineHeight: scale(18),
    color: colors.muted,
  },
  missionRadio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.shadeE1E1DD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionRadioSelected: {
    backgroundColor: colors.shade000,
    borderColor: colors.shade000,
  },
  missionCheck: {
    color: colors.surface,
    fontSize: scale(15),
    fontWeight: '900',
  },
  segmented: {
    height: 45,
    backgroundColor: colors.shadeECECEA,
    borderRadius: 22,
    flexDirection: 'row',
    padding: 3,
    marginTop: 30,
  },
  segmentTab: {
    flex: 1,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: { backgroundColor: colors.surface },
  segmentText: { fontSize: scale(14), color: colors.text, fontWeight: '700' },
  amountCard: {
    height: 300,
    backgroundColor: colors.surface,
    borderRadius: 22,
    marginTop: 24,
    paddingTop: 58,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  amountButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.shade000,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  amountButtonText: {
    fontSize: scale(37),
    lineHeight: scale(40),
    color: colors.surface,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: scale(72),
    lineHeight: scale(82),
    color: colors.shade000,
    textAlign: 'center',
    fontWeight: '500',
  },
  amountUnit: { fontSize: scale(17), color: colors.muted, textAlign: 'center' },
  amountHelp: {
    position: 'absolute',
    top: 190,
    left: 20,
    right: 20,
    fontSize: scale(15),
    lineHeight: scale(21),
    color: colors.muted,
    textAlign: 'center',
  },
  whyWrap: {
    flex: 1,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseSun: { fontSize: scale(122), marginBottom: 65 },
  whyTitle: {
    fontSize: scale(19),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  whyCopy: {
    fontSize: scale(16),
    lineHeight: scale(22),
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
  soundList: { marginTop: 20 },
  soundGroup: {
    fontSize: scale(13),
    letterSpacing: scale(1.4),
    color: colors.shade6E6E69,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  soundRow: {
    height: 62,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.shadeE7E7E3,
    backgroundColor: colors.surface,
  },
  soundOrb: { width: 42, fontSize: scale(29) },
  soundName: {
    flex: 1,
    fontSize: scale(16),
    fontWeight: '500',
    color: colors.text,
  },
  play: { fontSize: scale(13), color: colors.shade8E8E89, marginRight: 25 },
  referralRow: {
    marginTop: 235,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralInput: {
    flex: 1,
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: colors.shadeEEEEEA,
    fontSize: scale(16),
    color: colors.text,
    paddingHorizontal: 10,
  },
  referralSubmit: {
    height: 48,
    minWidth: 108,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.shade333,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralSubmitDisabled: { backgroundColor: colors.shade999 },
  referralSubmitText: {
    fontSize: scale(17),
    fontWeight: '700',
    color: colors.surface,
  },
  speedCard: {
    height: 390,
    borderRadius: 24,
    backgroundColor: colors.surface,
    marginTop: 110,
    paddingHorizontal: 24,
    paddingTop: 38,
    shadowColor: colors.shade111,
    shadowOpacity: 0.025,
    shadowRadius: 18,
  },
  gaugeViewport: { height: 210, alignItems: 'center', overflow: 'hidden' },
  gaugeArc: {
    position: 'absolute',
    top: 0,
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 25,
    borderLeftColor: colors.shadeF84E52,
    borderTopColor: colors.shadeF7AF24,
    borderRightColor: colors.shade20C997,
    borderBottomColor: colors.transparent,
  },
  gaugeInnerMask: {
    position: 'absolute',
    top: 47,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: colors.surface,
  },
  gaugeNeedle: {
    position: 'absolute',
    top: 153,
    width: 190,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.shade080808,
  },
  gaugePin: {
    position: 'absolute',
    top: 144,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 6,
    borderColor: colors.shade080808,
  },
  speedValue: {
    position: 'absolute',
    top: 82,
    fontSize: scale(55),
    lineHeight: scale(64),
    color: colors.shade000,
    fontWeight: '900',
    letterSpacing: scale(-2),
  },
  fasterLabel: {
    position: 'absolute',
    top: 146,
    fontSize: scale(13),
    color: colors.shade999894,
    fontWeight: '800',
  },
  speedEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  slowLabel: {
    fontSize: scale(18),
    color: colors.shadeF04C59,
    fontWeight: '800',
  },
  instantLabel: {
    fontSize: scale(18),
    color: colors.shade23BF9D,
    fontWeight: '800',
    textAlign: 'right',
  },
  endSub: { fontSize: scale(14), color: colors.shade999994, marginTop: 4 },
  endSubRight: { textAlign: 'right' },
  speedDescription: {
    fontSize: scale(17),
    lineHeight: scale(22),
    color: colors.shade696964,
    textAlign: 'center',
    marginTop: 17,
  },
  notificationWrap: {
    flex: 1,
    minHeight: 540,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  notificationGlow: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: colors.shadeFFBE2E,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 52,
    shadowColor: colors.shadeFFBA1C,
    shadowOpacity: 0.32,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  notificationBell: { fontSize: scale(46) },
  notificationTitle: {
    fontSize: scale(29),
    lineHeight: scale(35),
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  notificationCopy: {
    fontSize: scale(17),
    lineHeight: scale(24),
    color: colors.muted,
    textAlign: 'center',
    marginTop: 14,
  },
  setupScreen: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 160,
    backgroundColor: colors.background,
  },
  setupPercent: {
    fontSize: scale(68),
    lineHeight: scale(78),
    color: colors.shade000,
    fontWeight: '800',
    textAlign: 'center',
  },
  setupTitle: {
    fontSize: scale(29),
    lineHeight: scale(34),
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
  },
  setupTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.shadeEDEDE9,
    overflow: 'hidden',
    marginTop: 28,
  },
  setupFill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  setupFillDone: { backgroundColor: colors.shade31CC72 },
  setupStatus: { fontSize: scale(15), color: colors.muted, marginTop: 10 },
  setupCard: {
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  setupRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.shadeECECE8,
  },
  setupRowCopy: { flex: 1 },
  setupRowTitle: { fontSize: scale(14), fontWeight: '700', color: colors.text },
  setupRowMuted: { color: colors.shadeC2C2BD },
  setupRowSubtitle: { fontSize: scale(12), color: colors.muted, marginTop: 3 },
  setupCheck: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.shadeDADAD5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupCheckDone: {
    backgroundColor: colors.shade2FD071,
    borderColor: colors.shade2FD071,
  },
  setupCheckText: {
    fontSize: scale(17),
    color: colors.surface,
    fontWeight: '900',
  },
  planScreen: { flex: 1, backgroundColor: colors.background },
  planContent: { paddingHorizontal: 20, paddingTop: 30, alignItems: 'center' },
  planStars: { fontSize: scale(18), color: colors.shadeB79A2D },
  planTitle: {
    fontSize: scale(35),
    lineHeight: scale(42),
    fontWeight: '900',
    color: colors.text,
    marginTop: 12,
  },
  planSubtitle: {
    fontSize: scale(16),
    color: colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  planPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
  },
  planPill: {
    fontSize: scale(12),
    color: colors.shade656560,
    backgroundColor: colors.shadeECECE9,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    overflow: 'hidden',
  },
  todayCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 22,
    marginTop: 34,
  },
  sectionEyebrow: {
    fontSize: scale(13),
    color: colors.shade777772,
    letterSpacing: scale(1.2),
    marginBottom: 16,
  },
  sectionEyebrowCenter: {
    fontSize: scale(13),
    color: colors.shade888883,
    letterSpacing: scale(1.4),
    textAlign: 'center',
    marginVertical: 8,
  },
  planStep: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  planStepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.shade000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planStepSuccess: { backgroundColor: colors.shade2DCE72 },
  planStepIconText: {
    color: colors.surface,
    fontSize: scale(16),
    fontWeight: '800',
  },
  planStepText: { fontSize: scale(17), color: colors.text, fontWeight: '500' },
  todayCopy: {
    fontSize: scale(15),
    lineHeight: scale(21),
    color: colors.muted,
    textAlign: 'center',
    marginTop: 14,
  },
  downChevron: {
    fontSize: scale(24),
    color: colors.shade999994,
    marginVertical: 8,
  },
  receiptCard: {
    width: '100%',
    height: 210,
    borderRadius: 24,
    backgroundColor: colors.shade9CC4CF,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'flex-end',
  },
  receiptDate: {
    position: 'absolute',
    top: 16,
    left: 20,
    color: colors.surface,
    fontWeight: '800',
    letterSpacing: scale(2),
  },
  receiptScene: {
    position: 'absolute',
    top: 42,
    left: 30,
    right: 30,
    fontSize: scale(64),
    textAlign: 'center',
  },
  receiptTime: {
    fontSize: scale(31),
    color: colors.surface,
    fontWeight: '900',
  },
  receiptMission: {
    fontSize: scale(15),
    color: colors.surface,
    fontWeight: '700',
    marginTop: 3,
  },
  repeatCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
  },
  repeatTitle: { fontSize: scale(25), fontWeight: '800', color: colors.text },
  repeatCopy: {
    fontSize: scale(16),
    lineHeight: scale(22),
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
  },
  dayCircles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLetter: { fontSize: scale(13), fontWeight: '700', color: colors.text },
  testimonial: {
    width: '100%',
    minHeight: 104,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 15,
    flexDirection: 'row',
    marginTop: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.shadeEAEAE6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testimonialCopy: { flex: 1 },
  testimonialTop: { flexDirection: 'row', justifyContent: 'space-between' },
  testimonialName: {
    fontSize: scale(16),
    fontWeight: '800',
    color: colors.text,
  },
  testimonialStars: {
    fontSize: scale(12),
    color: colors.shadeF0642E,
    fontWeight: '700',
  },
  testimonialQuote: {
    fontSize: scale(13),
    lineHeight: scale(18),
    color: colors.muted,
    marginTop: 8,
  },
  planBottomSpace: { height: 90 },
  planFooter: { position: 'absolute', left: 20, right: 20, bottom: 14 },
  accountScreen: {
    flex: 1,
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  accountTitle: { fontSize: scale(31), fontWeight: '900', color: colors.text },
  accountSubtitle: {
    fontSize: scale(16),
    color: colors.muted,
    marginTop: 10,
    marginBottom: 34,
    textAlign: 'center',
  },
  appleButton: {
    height: 58,
    borderRadius: 29,
    width: '100%',
    backgroundColor: colors.shade000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    fontSize: scale(19),
    fontWeight: '600',
    color: colors.surface,
  },
  googleButton: {
    height: 58,
    borderRadius: 29,
    width: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: colors.shade111,
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  googleButtonText: {
    fontSize: scale(18),
    fontWeight: '500',
    color: colors.text,
  },
  skipAccount: {
    fontSize: scale(16),
    color: colors.shade999994,
    marginTop: 24,
  },
});
