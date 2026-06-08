export type ProfileOption = { id: string; label: string };

export type ProfileQuestion = {
  id: string;
  icon: string;
  question: string;
  options: ProfileOption[];
};

// Persönliche Fragen, die Wando vor dem ersten Roadmap-Besuch stellt,
// damit die Schritte später auf die Lebenssituation zugeschnitten werden können.
// (Liste wird nach und nach um weitere, detailliertere Fragen ergänzt.)
export const ROADMAP_PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    id: 'situation',
    icon: '🎯',
    question: 'Wie sieht deine aktuelle Lebenssituation am ehesten aus?',
    options: [
      { id: 'school', label: 'Schule / Ausbildung / Studium' },
      { id: 'work', label: 'Berufstätig' },
      { id: 'retired', label: 'Rentner:in / im Ruhestand' },
    ],
  },
  {
    id: 'employment',
    icon: '💼',
    question: 'Wie bist du beruflich aufgestellt?',
    options: [
      { id: 'employed', label: 'Angestellt' },
      { id: 'selfEmployed', label: 'Selbstständig / Freiberuflich' },
      { id: 'jobSeeking', label: 'Auf Jobsuche' },
      { id: 'notApplicable', label: 'Trifft auf mich nicht zu' },
    ],
  },
  {
    id: 'age',
    icon: '🎂',
    question: 'Wie alt bist du?',
    options: [
      { id: 'under25', label: 'Unter 25' },
      { id: '25to39', label: '25 – 39' },
      { id: '40to59', label: '40 – 59' },
      { id: '60plus', label: '60 oder älter' },
    ],
  },
  {
    id: 'car',
    icon: '🚗',
    question: 'Hast du ein Auto, das für den Umzug relevant wäre?',
    options: [
      { id: 'bringCar', label: 'Ja – ich möchte es mitnehmen' },
      { id: 'sellCar', label: 'Ja – ich werde es verkaufen' },
      { id: 'noCar', label: 'Nein, kein Auto' },
    ],
  },
  {
    id: 'property',
    icon: '🏠',
    question: 'Besitzt du eine Immobilie in Deutschland?',
    options: [
      { id: 'sellProperty', label: 'Ja – ich werde sie verkaufen' },
      { id: 'rentOutProperty', label: 'Ja – ich werde sie vermieten' },
      { id: 'keepProperty', label: 'Ja – ich behalte sie ungenutzt' },
      { id: 'noProperty', label: 'Nein, keine eigene Immobilie' },
    ],
  },
];
