import { create } from 'zustand';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  summary?: string;
  fullText: string;
  url: string;
}

interface SelectedNewsStore {
  selectedNews: NewsItem | null;
  setSelectedNews: (news: NewsItem | null) => void;
  selectNewsById: (newsId: string) => void;
  pendingNewsId: string | null;
  clearPendingNewsId: () => void;
}

export const useSelectedNewsStore = create<SelectedNewsStore>((set) => ({
  selectedNews: null,
  pendingNewsId: null,
  setSelectedNews: (news) => set({ selectedNews: news }),
  selectNewsById: (newsId) => set({ pendingNewsId: newsId }),
  clearPendingNewsId: () => set({ pendingNewsId: null }),
}));
