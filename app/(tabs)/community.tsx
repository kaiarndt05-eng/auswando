import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, CountryId } from '@/constants/theme';
import { FLAG_IMAGES } from '@/constants/images';

type Post = {
  id: string;
  country: CountryId | 'all';
  user: string;
  avatar: string;
  text: string;
  likes: number;
  comments: number;
  time: string;
  pinned?: boolean;
};

const POSTS: Post[] = [
  { id: '1', country: 'es', user: 'Klaus M.', avatar: '👨‍💼', text: 'Mein Beckham Law Antrag wurde nach 4 Monaten bewilligt! 🎉 Hier der genaue Ablauf mit allen Dokumenten die ich gebraucht habe...', likes: 87, comments: 34, time: 'vor 3h', pinned: true },
  { id: '2', country: 'pt', user: 'Sarah K.', avatar: '👩', text: 'NHR-Antrag gestellt! Hat jemand Erfahrung damit, ob man beim ersten Antrag immer einen Steuerberater braucht? Mein NIF ist seit 2 Wochen aktiv.', likes: 24, comments: 18, time: 'vor 5h' },
  { id: '3', country: 'ch', user: 'Markus R.', avatar: '👨', text: 'Kanton Zug vs. Zug: Habe beide verglichen. Steuern im Kanton Zug sind ca. 40% günstiger als in Zürich bei meinem Einkommen. Lohnt sich der längere Arbeitsweg!', likes: 56, comments: 22, time: 'vor 8h' },
  { id: '4', country: 'pt', user: 'Lena B.', avatar: '👩‍🦱', text: 'Für alle die fragen: Mit EU-Pass dauert der AIMA-Termin in Lissabon aktuell ca. 3-4 Monate. In Porto geht es schneller. Termin asap buchen!', likes: 103, comments: 47, time: 'vor 1d' },
  { id: '5', country: 'es', user: 'Thomas W.', avatar: '🧑', text: 'Barcelona vs. Valencia: Nach 2 Jahren kann ich sagen – Valencia ist für Familien viel entspannter. Günstigere Mieten, weniger Touristen, trotzdem super Infrastruktur.', likes: 71, comments: 29, time: 'vor 2d' },
  { id: '6', country: 'all', user: 'Julia S.', avatar: '👩‍💻', text: 'Tipp für alle: Holt euch eine N26 oder Wise Karte BEVOR ihr auswandert. Macht das Leben in den ersten Wochen so viel einfacher bis das lokale Konto läuft.', likes: 134, comments: 51, time: 'vor 3d' },
  { id: '7', country: 'ch', user: 'David H.', avatar: '🧑‍💼', text: 'Remote-Job aus Deutschland, jetzt Wohnsitz Schweiz. Achtung: Man muss seinen AG über den Wohnsitzwechsel informieren, sonst gibt es steuerliche Probleme!', likes: 45, comments: 16, time: 'vor 4d' },
];

const FILTERS: { id: CountryId | 'all'; label: string; flag: string }[] = [
  { id: 'all', label: 'Alle', flag: '🌍' },
  { id: 'pt', label: 'Portugal', flag: '🇵🇹' },
  { id: 'es', label: 'Spanien', flag: '🇪🇸' },
  { id: 'ch', label: 'Schweiz', flag: '🇨🇭' },
];

const COUNTRY_COLOR: Record<string, string> = {
  pt: '#1BCAA0',
  es: '#F5A623',
  ch: '#F87171',
  all: C.primary,
};

const ONLINE = 847;

export default function CommunityScreen() {
  const [filter, setFilter] = useState<CountryId | 'all'>('all');
  const filtered = POSTS.filter(p => filter === 'all' || p.country === filter || p.country === 'all');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={[`${C.primary}18`, C.bg]} style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>Community</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>{ONLINE.toLocaleString('de')} Mitglieder online</Text>
            </View>
          </View>
          <TouchableOpacity style={s.postBtn}>
            <Text style={s.postBtnTxt}>+ Posten</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={s.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[s.filterBtn, filter === f.id && { backgroundColor: `${COUNTRY_COLOR[f.id]}20`, borderColor: COUNTRY_COLOR[f.id] }]}
            onPress={() => setFilter(f.id)}
          >
            {f.id === 'all'
              ? <Text style={s.filterFlagEmoji}>🌍</Text>
              : <Image source={FLAG_IMAGES[f.id as CountryId]} style={s.filterFlag} />
            }
            <Text style={[s.filterLabel, { color: filter === f.id ? COUNTRY_COLOR[f.id] : C.textSub }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.feed} showsVerticalScrollIndicator={false}>
        {filtered.map(post => {
          const color = COUNTRY_COLOR[post.country];
          return (
            <View key={post.id} style={[s.postCard, post.pinned && { borderColor: `${color}44` }]}>
              {post.pinned && (
                <View style={[s.pinnedBadge, { backgroundColor: `${color}18` }]}>
                  <Text style={[s.pinnedTxt, { color }]}>📌 Angepinnt</Text>
                </View>
              )}
              <View style={s.postHeader}>
                <Text style={s.avatar}>{post.avatar}</Text>
                <View style={s.postMeta}>
                  <Text style={s.postUser}>{post.user}</Text>
                  <View style={s.postSubRow}>
                    <View style={[s.countryTag, { backgroundColor: `${color}18`, borderColor: `${color}33` }]}>
                      <Text style={[s.countryTagTxt, { color }]}>
                        {FILTERS.find(f => f.id === post.country)?.flag} {FILTERS.find(f => f.id === post.country)?.label}
                      </Text>
                    </View>
                    <Text style={s.postTime}>{post.time}</Text>
                  </View>
                </View>
              </View>
              <Text style={s.postText}>{post.text}</Text>
              <View style={s.postActions}>
                <TouchableOpacity style={s.actionBtn}>
                  <Text style={s.actionTxt}>❤️  {post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Text style={s.actionTxt}>💬  {post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Text style={s.actionTxt}>↗  Teilen</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Premium locked section */}
        <View style={s.lockedSection}>
          <LinearGradient colors={[C.card, C.bg]} style={s.lockedCard}>
            <Text style={s.lockedIcon}>🔒</Text>
            <Text style={s.lockedTitle}>Mehr Community-Features</Text>
            <Text style={s.lockedSub}>Direktnachrichten · Gruppen · Experten-Chats · Influencer Events</Text>
            <TouchableOpacity style={s.lockedBtn}>
              <Text style={s.lockedBtnTxt}>Premium für 49 € freischalten</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { padding: 16, paddingTop: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: C.text, fontSize: 22, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.success },
  onlineTxt: { color: C.textSub, fontSize: 12 },
  postBtn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  postBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  filters: { flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 10, paddingVertical: 7, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  filterFlag: { width: 20, height: 20, borderRadius: 10 },
  filterFlagEmoji: { fontSize: 14 },
  filterLabel: { fontSize: 11, fontWeight: '600' },
  feed: { padding: 12, gap: 12, paddingBottom: 40 },
  postCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  pinnedBadge: { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, alignSelf: 'flex-start', marginBottom: 10 },
  pinnedTxt: { fontSize: 11, fontWeight: '700' },
  postHeader: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  avatar: { fontSize: 32, lineHeight: 40 },
  postMeta: { flex: 1, justifyContent: 'center' },
  postUser: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  postSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countryTag: { borderRadius: 5, paddingVertical: 2, paddingHorizontal: 6, borderWidth: 1 },
  countryTagTxt: { fontSize: 10, fontWeight: '600' },
  postTime: { color: C.textMuted, fontSize: 11 },
  postText: { color: C.textSub, fontSize: 14, lineHeight: 21, marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 16 },
  actionBtn: {},
  actionTxt: { color: C.textMuted, fontSize: 13 },
  lockedSection: { marginTop: 4 },
  lockedCard: { borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  lockedIcon: { fontSize: 36, marginBottom: 12 },
  lockedTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  lockedSub: { color: C.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  lockedBtn: { backgroundColor: C.success, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  lockedBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
