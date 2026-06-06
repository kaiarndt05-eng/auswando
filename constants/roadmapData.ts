import { CountryId } from './theme';

export type Step = { title: string; desc: string; free: boolean; icon: string; link?: string };
export type Phase = { title: string; steps: Step[] };

export const ROADMAP_DATA: Record<CountryId, Phase[]> = {
  pt: [
    {
      title: 'Phase 1 · Vorbereitung (6–12 Monate vorher)',
      steps: [
        { title: 'Erkundungsreise planen', desc: 'Schau dir das Land persönlich an, lerne Städte kennen', free: true, icon: '✈️' },
        { title: 'NIF (Steuernummer) beantragen', desc: 'Ohne NIF geht in Portugal nichts. Online oder beim Konsulat möglich', free: true, icon: '🔢' },
        { title: 'Portugiesisches Bankkonto', desc: 'Milleniumcp, Novobanco oder ActivoBank empfehlenswert', free: true, icon: '🏦' },
        { title: 'Krankenversicherung prüfen', desc: 'EU-Karte, private Versicherung oder SNS-Zugang klären', free: false, icon: '🏥' },
        { title: 'NHR-Steuerstatus verstehen', desc: 'Steuervorteil für 10 Jahre – Antrag muss früh gestellt werden', free: false, icon: '📊' },
      ],
    },
    {
      title: 'Phase 2 · Abmeldung in Deutschland',
      steps: [
        { title: 'Einwohnermeldeamt: Abmeldung', desc: 'Persönlich durchführen, mind. 1 Woche vor Umzug', free: false, icon: '📋' },
        { title: 'GKV/PKV kündigen oder ummelden', desc: 'Fristen beachten! Kündigung nicht immer sofort möglich', free: false, icon: '📝' },
        { title: 'Finanzamt: steuerliche Abmeldung', desc: 'Wegzugsbesteuerung prüfen falls Beteiligungen vorhanden', free: false, icon: '🏛️' },
        { title: 'Deutsche Rentenversicherung klären', desc: 'DRV-Auskunft einholen, freiwillige Weiterversicherung prüfen', free: false, icon: '💼' },
      ],
    },
    {
      title: 'Phase 3 · Ankommen in Portugal',
      steps: [
        { title: 'Anmeldung bei der Gemeinde (Registo)', desc: 'Wohnsitzbestätigung als Basis für alles weitere', free: false, icon: '🏘️' },
        { title: 'NHR-Antrag beim Finanzamt stellen', desc: 'Innerhalb der ersten Tage nach Anmeldung – Frist beachten!', free: false, icon: '📑' },
        { title: 'AIMA-Termin: Aufenthaltstitel', desc: 'Termin online buchen unter aima.gov.pt', free: false, icon: '🔑', link: 'https://aima.gov.pt' },
      ],
    },
  ],
  es: [
    {
      title: 'Phase 1 · Vorbereitung (6–12 Monate vorher)',
      steps: [
        { title: 'Spanisch-Grundkenntnisse aneignen', desc: 'Ohne Spanisch wird es im Alltag schwierig', free: true, icon: '🗣️' },
        { title: 'NIE-Nummer beantragen', desc: 'Número de Identidad de Extranjero – für alles nötig', free: true, icon: '🔢' },
        { title: 'Spanisches Bankkonto', desc: 'Sabadell, BBVA oder Santander empfehlenswert', free: true, icon: '🏦' },
        { title: 'Beckham Law prüfen (falls qualifiziert)', desc: 'Flat Tax 24% für Hochqualifizierte aus dem Ausland', free: false, icon: '⚖️' },
        { title: 'Sozialversicherung: Autónomo oder Angestellt', desc: 'RETA (Selbstständige) vs. Régimen General', free: false, icon: '📊' },
      ],
    },
    {
      title: 'Phase 2 · Abmeldung in Deutschland',
      steps: [
        { title: 'Einwohnermeldeamt: Abmeldung', desc: 'Persönlich vor Abreise', free: false, icon: '📋' },
        { title: 'Krankenversicherung regeln', desc: 'Private KV oder RETA-Beitrag klären', free: false, icon: '📝' },
        { title: 'Steuerliche Ummeldung', desc: 'Finanzamt über Wegzug informieren', free: false, icon: '🏛️' },
      ],
    },
    {
      title: 'Phase 3 · Ankommen in Spanien',
      steps: [
        { title: 'Empadronamiento (Anmeldung)', desc: 'Im Rathaus der Gemeinde, mit Mietvertrag', free: false, icon: '🏘️' },
        { title: 'TIE beantragen (Aufenthaltstitel)', desc: 'Tarjeta de Identidad de Extranjero', free: false, icon: '🔑' },
        { title: 'Beckham Law Antrag einreichen', desc: 'Innerhalb von 6 Monaten nach Aufnahme Arbeit in Spanien', free: false, icon: '📑' },
      ],
    },
  ],
  ch: [
    {
      title: 'Phase 1 · Vorbereitung (6–12 Monate vorher)',
      steps: [
        { title: 'Arbeitsstelle in der Schweiz sichern', desc: 'Für EU-Bürger: freizügig, aber Job erleichtert alles', free: true, icon: '💼' },
        { title: 'Kanton und Stadt wählen', desc: 'Steuerliche Unterschiede zwischen Kantonen sind erheblich!', free: true, icon: '🗺️' },
        { title: 'Schweizer Mietmarkt kennenlernen', desc: 'Ohne Bonität-Nachweis keine Wohnung – früh kümmern', free: true, icon: '🏠' },
        { title: 'Steueroptimierung per Kanton prüfen', desc: 'Zug, Schwyz, Nidwalden haben günstigste Steuern', free: false, icon: '📊' },
        { title: 'Krankenversicherung CH abschließen', desc: 'Pflicht innerhalb von 3 Monaten nach Einreise', free: false, icon: '🏥' },
      ],
    },
    {
      title: 'Phase 2 · Abmeldung in Deutschland',
      steps: [
        { title: 'Einwohnermeldeamt: Abmeldung', desc: 'Pflicht bei endgültigem Wegzug', free: false, icon: '📋' },
        { title: 'Deutsche Krankenversicherung kündigen', desc: 'Erst nach Nachweis der Schweizer KV möglich', free: false, icon: '📝' },
        { title: 'Rentenansprüche sichern', desc: 'Deutsch-schweizer Sozialversicherungsabkommen beachten', free: false, icon: '💼' },
      ],
    },
    {
      title: 'Phase 3 · Ankommen in der Schweiz',
      steps: [
        { title: 'Anmeldung bei Gemeindeverwaltung', desc: 'Innerhalb von 14 Tagen nach Einzug Pflicht', free: false, icon: '🏘️' },
        { title: 'Aufenthaltsbewilligung beantragen', desc: 'Ausweis B (EU) über kantonales Migrationsamt', free: false, icon: '🔑' },
        { title: 'Steuererklärung: Quellensteuer verstehen', desc: 'Gilt bis bestimmtes Einkommen, danach ordentliche Veranlagung', free: false, icon: '📑' },
      ],
    },
  ],
};
