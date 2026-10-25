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
  embed_code?: string | null;
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
  caption_bn?: string | null;
  caption_en?: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  category: GalleryCategory;
  date_label?: string | null;
  order_index: number;
  created_at: string;
}

export interface DownloadItem {
  id: string;
  title_bn: string;
  title_en?: string | null;
  description_bn?: string | null;
  description_en?: string | null;
  category?: 'syllabus' | 'routine' | 'admission' | 'calendar' | 'other';
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

export type ReviewPlatform = "google" | "facebook" | "trustpilot" | "website";

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
  platform?: ReviewPlatform;
}

export type PaymentMethodType = "bank" | "bkash" | "nagad" | "rocket" | "upay" | "other";

export interface PaymentAccountItem {
  id: string;
  type: PaymentMethodType;
  title_bn: string;
  title_en: string;
  account_number: string;
  account_name?: string | null;
  account_type?: "personal" | "merchant" | "agent" | "savings" | "current" | null;
  bank_name_bn?: string | null;
  bank_name_en?: string | null;
  branch_bn?: string | null;
  branch_en?: string | null;
  routing_no?: string | null;
  instructions_bn?: string | null;
  instructions_en?: string | null;
  is_active: boolean;
}

export interface SiteSettings {
  id: number;
  institution_name_bn: string;
  institution_name_en: string;
  tagline_bn?: string | null;
  tagline_en?: string | null;
  emis_code?: string | null;
  founding_year?: string | null;
  phone_primary: string;
  phone_secondary?: string | null;
  whatsapp_number: string;
  email_primary: string;
  website_url?: string | null;
  address_boys_campus_bn?: string | null;
  address_boys_campus_en?: string | null;
  address_girls_campus_bn?: string | null;
  address_girls_campus_en?: string | null;
  google_maps_url?: string | null;
  facebook_url?: string | null;
  facebook_group_url?: string | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  twitter_url?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  hero_image_url?: string | null;
  color_palette?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  admission_status: AdmissionStatusType;

  // Board Affiliations & Registrations
  befaq_name?: string | null;
  befaq_reg_no?: string | null;
  huffaz_name?: string | null;
  huffaz_reg_no?: string | null;
  nurani_name?: string | null;
  nurani_reg_no?: string | null;
  trade_license_no?: string | null;

  // Banking & Payment
  bank_name_bn?: string | null;
  bank_name_en?: string | null;
  bank_account_name?: string | null;
  bank_account_no?: string | null;
  bank_branch_bn?: string | null;
  bank_branch_en?: string | null;
  bank_routing_no?: string | null;
  bkash_number?: string | null;
  bkash_type?: "merchant" | "personal" | null;
  nagad_number?: string | null;
  nagad_type?: "merchant" | "personal" | null;
  rocket_number?: string | null;
  rocket_type?: "merchant" | "personal" | null;
  payment_instructions_bn?: string | null;
  payment_instructions_en?: string | null;
  payment_accounts?: PaymentAccountItem[] | null;

  // Leadership & Administration
  founder_name_bn?: string | null;
  founder_name_en?: string | null;
  founder_title_bn?: string | null;
  founder_title_en?: string | null;
  founder_message_bn?: string | null;
  founder_message_en?: string | null;
  founder_image_url?: string | null;
  founder_phone?: string | null;

  principal_name_bn?: string | null;
  principal_name_en?: string | null;
  principal_title_bn?: string | null;
  principal_title_en?: string | null;
  principal_message_bn?: string | null;
  principal_message_en?: string | null;
  principal_image_url?: string | null;
  principal_phone?: string | null;
  principal_email?: string | null;

  vice_principal_name_bn?: string | null;
  vice_principal_name_en?: string | null;
  vice_principal_title_bn?: string | null;
  vice_principal_title_en?: string | null;
  vice_principal_message_bn?: string | null;
  vice_principal_message_en?: string | null;
  vice_principal_image_url?: string | null;
  vice_principal_phone?: string | null;
  vice_principal_email?: string | null;

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

export interface CurriculumProgram {
  id: string;
  department_bn: string;
  department_en: string;
  category: "nurani" | "nazara" | "hifz" | "general" | "tarbiya";
  age_group_bn: string;
  age_group_en: string;
  duration_bn: string;
  duration_en: string;
  description_bn: string;
  description_en: string;
  subjects_bn: string[];
  subjects_en: string[];
  features_bn: string[];
  features_en: string[];
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FeeStructureItem {
  id: string;
  type_bn: string;
  type_en: string;
  amount_bn: string;
  amount_en: string;
  note_bn: string;
  note_en: string;
  category?: 'tuition' | 'admission' | 'exam' | 'other';
  highlight?: boolean;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdmissionRuleItem {
  id: string;
  rule_bn: string;
  rule_en: string;
  type: 'rule' | 'document' | 'step';
  is_required: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export type FacultyRoleCategory = 'management' | 'teacher' | 'staff';
export type CampusType = 'boys' | 'girls' | 'both';

export interface FacultyMember {
  id: string;
  teacher_id?: string;
  nid?: string;
  joining_year?: string;
  name_bn: string;
  name_en: string;
  designation_bn: string;
  designation_en: string;
  category: FacultyRoleCategory;
  campus: CampusType;
  qualification_bn?: string;
  qualification_en?: string;
  subject_bn?: string;
  subject_en?: string;
  experience_bn?: string;
  experience_en?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  bio_bn?: string;
  bio_en?: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HafezRecord {
  id: string;
  name_bn: string;
  name_en: string;
  father_name_bn?: string;
  father_name_en?: string;
  completion_year: string;
  duration_bn?: string;
  duration_en?: string;
  age_at_completion?: string;
  campus: 'boys' | 'girls';
  teacher_name_bn?: string;
  teacher_name_en?: string;
  district_bn?: string;
  district_en?: string;
  award_title_bn?: string;
  award_title_en?: string;
  image_url?: string;
  is_featured?: boolean;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}



