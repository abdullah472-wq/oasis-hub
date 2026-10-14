export type UserRole = 'super_admin' | 'editor';

export type NoticeCategory = 'general' | 'academic' | 'admission' | 'holiday' | 'emergency';

export type MediaType = 'video' | 'playlist' | 'livestream';

export type GalleryCategory = 'campus' | 'event' | 'academic' | 'achievement';

export type AdmissionStatusType = 'open' | 'closed' | 'upcoming';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  title_bn: string;
  title_en?: string | null;
  content_bn: string;
  content_en?: string | null;
  category: NoticeCategory;
  pdf_url?: string | null;
  is_published: boolean;
  is_featured: boolean;
  priority: number;
  published_at: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaVideo {
  id: string;
  title_bn: string;
  title_en?: string | null;
  youtube_url: string;
  youtube_video_id: string;
  type: MediaType;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title_bn: string;
  title_en?: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  category: GalleryCategory;
  order_index: number;
  created_at: string;
}

export interface DownloadItem {
  id: string;
  title_bn: string;
  title_en?: string | null;
  description_bn?: string | null;
  description_en?: string | null;
  file_url: string;
  file_size_label?: string | null;
  file_type?: string | null;
  download_count: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface MarqueeNotice {
  id: string;
  text_bn: string;
  text_en?: string | null;
  link_url?: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface HeroBanner {
  id: string;
  title_bn: string;
  title_en?: string | null;
  subtitle_bn?: string | null;
  subtitle_en?: string | null;
  image_url: string;
  cta_text_bn?: string | null;
  cta_text_en?: string | null;
  cta_link?: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  title_bn: string;
  title_en?: string | null;
  year: string;
  category_bn?: string | null;
  description_bn: string;
  description_en?: string | null;
  image_url?: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  relation_title_bn: string;
  relation_title_en?: string | null;
  review_text_bn: string;
  review_text_en?: string | null;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  institution_name_bn: string;
  institution_name_en: string;
  emis_code?: string | null;
  founding_year?: string | null;
  phone_primary: string;
  phone_secondary?: string | null;
  whatsapp_number: string;
  email_primary: string;
  address_boys_campus_bn?: string | null;
  address_boys_campus_en?: string | null;
  address_girls_campus_bn?: string | null;
  address_girls_campus_en?: string | null;
  google_maps_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  admission_status: AdmissionStatusType;
  updated_at: string;
  updated_by?: string | null;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: string;
  details: string;
  created_at: string;
}
