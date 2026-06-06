import { supabase } from './supabase';
import { CountryId } from '@/constants/theme';
import { AppState } from '@/context/AppContext';

export type RemoteProgress = {
  selected_country: CountryId;
  completed_steps: Record<CountryId, string[]>;
  emigration_date: string | null;
};

/** Pull user's progress from Supabase. Returns null if no row exists yet. */
export async function fetchProgress(userId: string): Promise<RemoteProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('selected_country, completed_steps, emigration_date')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as RemoteProgress;
}

/** Upsert the user's progress. Fire-and-forget — local state is already updated. */
export async function pushProgress(userId: string, state: AppState): Promise<void> {
  await supabase.from('user_progress').upsert({
    id: userId,
    selected_country: state.selectedCountry,
    completed_steps: state.completedSteps,
    emigration_date: state.emigrationDate,
    updated_at: new Date().toISOString(),
  });
}

/** Ensure a profile row exists for a new user. */
export async function ensureProfile(userId: string, email?: string): Promise<void> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!data) {
    await supabase.from('profiles').insert({
      id: userId,
      username: email?.split('@')[0] ?? 'Auswanderer',
    });
  }
}

export type CommunityPost = {
  id: string;
  country_id: CountryId;
  content: string;
  likes: number;
  created_at: string;
  profiles: { username: string } | null;
};

export async function fetchCommunityPosts(countryId?: CountryId): Promise<CommunityPost[]> {
  let query = supabase
    .from('community_posts')
    .select('id, country_id, content, likes, created_at, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (countryId) query = query.eq('country_id', countryId);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as CommunityPost[];
}

export async function createCommunityPost(
  userId: string,
  countryId: CountryId,
  content: string,
): Promise<void> {
  await supabase.from('community_posts').insert({
    user_id: userId,
    country_id: countryId,
    content,
  });
}

export async function togglePostLike(postId: string, currentLikes: number): Promise<void> {
  await supabase
    .from('community_posts')
    .update({ likes: currentLikes + 1 })
    .eq('id', postId);
}
