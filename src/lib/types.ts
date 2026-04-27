export type LinkItem = {
  id: string;
  name: string;
  url: string;
  description: string;
  logoUrl?: string | null;
  sortOrder: number;
  categoryId: string;
};

export type Category = {
  id: string;
  name: string;
  sortOrder: number;
  isCollapsed: boolean;
  links: LinkItem[];
};

export type Settings = {
  id?: number; // Made optional as it's being removed from schema
  logo: string;
  title: string;
  copyright: string;
  searchEnabled: boolean;
  theme: string;
  appearanceMode: string;
};

// This type is no longer used for database operations
// but can be kept for reference or other purposes.
export type AppData = {
  settings: Settings;
  categories: Category[];
  adminPasswordHash: string;
};
