import { CountryId } from './theme';
import { WandoEmotion } from './images';

export type WandoMessage = {
  id: string;
  text: string;
  emotion?: WandoEmotion;
  flag?: CountryId;
  buttonLabel?: string;
};

export const WANDO_MESSAGES = {
  intro: {
    id: 'wando_intro',
    emotion: 'begeistert',
    buttonLabel: "Los geht's! →",
    text: 'Hallo, ich bin Wando! 👋 Von jetzt an begleite ich dich auf deinem Weg ins Ausland — ich erkläre dir jeden Bereich der App und freue mich mit dir über jeden Fortschritt. Schauen wir uns gemeinsam um!',
  } satisfies WandoMessage,

  home: {
    id: 'wando_home',
    emotion: 'neutral',
    text: 'Das ist deine Startseite. Hier siehst du deinen Fortschritt für dein Zielland und deinen nächsten Schritt. Falls du es dir anders überlegst, kannst du dein Zielland über das Fähnchen oben rechts wechseln.',
  } satisfies WandoMessage,

  test: {
    id: 'wando_test',
    emotion: 'neutral',
    text: 'Noch unentschlossen? Beantworte hier ein paar kurze Fragen zu dir — am Ende verrate ich dir, welches Land am besten zu dir passt.',
  } satisfies WandoMessage,

  testResult: (country: CountryId, name: string): WandoMessage => ({
    id: 'wando_test_result',
    emotion: 'begeistert',
    flag: country,
    buttonLabel: 'Zur Roadmap →',
    text: `Mein Tipp für dich: ${name}! 🎉 Ich habe direkt eine Roadmap mit allen nötigen Schritten für dich vorbereitet — schau sie dir gleich an.`,
  }),

  roadmap: {
    id: 'wando_roadmap',
    emotion: 'freude',
    text: 'Das ist deine persönliche Roadmap! Hake jeden erledigten Schritt ab und leg dein Zieldatum fest — ich feiere mit dir, wenn du eine ganze Phase abgeschlossen hast. 🎉',
  } satisfies WandoMessage,

  karte: {
    id: 'wando_karte',
    emotion: 'neutral',
    text: 'Auf der Karte siehst du deinen Weg von Deutschland in dein neues Zuhause — ein schöner Blick auf das große Ziel vor Augen.',
  } satisfies WandoMessage,

  community: {
    id: 'wando_community',
    emotion: 'freude',
    text: 'Hier in der Community tauschen sich andere Auswanderer aus. Stöbere durch Erfahrungsberichte oder filtere nach deinem Zielland — du bist nicht allein auf diesem Weg!',
  } satisfies WandoMessage,

  firstStepDone: {
    id: 'wando_first_step',
    emotion: 'freude',
    text: 'Geschafft — dein erster Schritt ist erledigt! 🎉 Genau so, einer nach dem anderen, kommst du deinem neuen Leben immer näher.',
  } satisfies WandoMessage,
};
