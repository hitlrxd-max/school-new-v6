export type NewsStatus = 'draft' | 'published'
export type MediaType = 'image' | 'video'
export type NotePriority = 'high' | 'normal' | 'low'
export type NoteStatus = 'important' | 'normal' | 'completed'

export interface News {
  id: string
  title: string
  slug: string
  short_description: string | null
  content: string | null
  category: string
  main_image: string | null
  status: NewsStatus
  published_at: string | null
  created_at: string
  updated_at: string
  author_id: string | null
}

export interface NewsMedia {
  id: string
  news_id: string
  url: string
  type: MediaType
  storage_path: string | null
  created_at: string
}

export interface AdminNote {
  id: string
  title: string
  content: string | null
  priority: NotePriority
  status: NoteStatus
  is_pinned: boolean
  created_at: string
  updated_at: string
  author_id: string | null
}

export interface DashboardStats {
  totalNews: number
  publishedNews: number
  draftNews: number
  totalImages: number
  totalVideos: number
  recentNews: News[]
  recentNotes: AdminNote[]
}
