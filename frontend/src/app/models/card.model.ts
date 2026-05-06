
export interface Card {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  image_data: string;
  image_urls: string[];
  tags: string[];
  master_tag: string;
  urls: string[];
  master_tag_data: any;
  document_data: string;
  document_name: string;
  created_at?: string;
  updated_at?: string;
}
