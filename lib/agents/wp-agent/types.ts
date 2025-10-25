/**
 * wpAgent Type Definitions
 * TypeScript types for WordPress site management and agent configuration
 */

// Local SubAgent interface
export interface SubAgent {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
}

export interface WordPressPost {
  id?: number;
  title: string;
  content: string;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  author?: number;
  excerpt?: string;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
  meta?: Record<string, any>;
  date?: string;
  slug?: string;
}

export interface WordPressPage {
  id?: number;
  title: string;
  content: string;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  parent?: number;
  menu_order?: number;
  template?: string;
}

export interface WordPressMedia {
  id?: number;
  title: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  media_type?: 'image' | 'video' | 'file';
  mime_type?: string;
  source_url?: string;
}

export interface WordPressUser {
  id?: number;
  username: string;
  email: string;
  name?: string;
  roles?: string[];
  password?: string;
}

export interface WordPressTheme {
  name: string;
  slug: string;
  version?: string;
  status?: 'active' | 'inactive';
  parent?: string;
  stylesheet?: string;
  template?: string;
}

export interface WordPressPlugin {
  name: string;
  plugin: string;
  status?: 'active' | 'inactive';
  version?: string;
  author?: string;
  description?: string;
}

export interface WpAgentConfig {
  anthropicApiKey?: string;
  tavilyApiKey?: string;
  model?: string;
  enableWebSearch?: boolean;
  enableTemplates?: boolean;
  enableSubAgents?: boolean;
  customNodes?: string[];
  customSubAgents?: SubAgent[];
  wordpressUrl?: string;
  wordpressUsername?: string;
  wordpressAppPassword?: string;
}

export interface WordPressOperationRequest {
  action: 'create' | 'update' | 'delete' | 'read' | 'list';
  type: 'post' | 'page' | 'media' | 'user' | 'theme' | 'plugin' | 'menu' | 'category' | 'tag';
  data?: any;
  filters?: Record<string, any>;
  id?: number | string;
}

export interface WordPressOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  warnings?: string[];
}

export interface WpAgentCapabilities {
  name: string;
  version: string;
  description: string;
  supportedOperations: string[];
  features: string[];
  subAgents: string[];
  tools: string[];
}

export interface WordPressSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
  namespaces: string[];
  authentication: {
    application_passwords?: boolean;
  };
  wp_version?: string;
}

export type WordPressContentType = 
  | 'post'
  | 'page'
  | 'attachment'
  | 'revision'
  | 'nav_menu_item'
  | 'custom_css'
  | 'customize_changeset'
  | 'oembed_cache'
  | 'user_request'
  | 'wp_block'
  | 'wp_template'
  | 'wp_template_part'
  | 'wp_global_styles'
  | 'wp_navigation';

export type WordPressStatus = 
  | 'publish'
  | 'future'
  | 'draft'
  | 'pending'
  | 'private'
  | 'trash'
  | 'auto-draft'
  | 'inherit';

export interface StreamingState {
  currentStep: string;
  progress: number;
  completedOperations: number;
  totalEstimatedOperations: number;
  currentOperation?: string;
  errors: string[];
  warnings: string[];
}

export interface WooCommerceProduct {
  id?: number;
  name: string;
  slug?: string;
  type?: 'simple' | 'grouped' | 'external' | 'variable';
  status?: 'draft' | 'pending' | 'private' | 'publish';
  featured?: boolean;
  catalog_visibility?: 'visible' | 'catalog' | 'search' | 'hidden';
  description?: string;
  short_description?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_quantity?: number;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  categories?: Array<{ id: number; name: string }>;
  images?: Array<{ id: number; src: string }>;
}

export interface WooCommerceOrder {
  id?: number;
  status?: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  currency?: string;
  total?: string;
  customer_id?: number;
  billing?: Record<string, any>;
  shipping?: Record<string, any>;
  line_items?: Array<any>;
  payment_method?: string;
  payment_method_title?: string;
}

export interface WordPressMenu {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  locations?: string[];
  items?: WordPressMenuItem[];
}

export interface WordPressMenuItem {
  id?: number;
  title: string;
  url?: string;
  type?: 'custom' | 'post_type' | 'taxonomy' | 'post_type_archive';
  object?: string;
  object_id?: number;
  parent?: number;
  menu_order?: number;
  target?: '_blank' | '_self';
  classes?: string[];
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_markup?: Record<string, any>;
}