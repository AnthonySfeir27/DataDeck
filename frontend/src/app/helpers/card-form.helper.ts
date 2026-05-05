/**
 * Card Form Helper
 * ----------------
 * Factory functions for card objects.
 * Eliminates the 3× repeated inline card initialization.
 */
import { Card } from '../models/card.model';

/**
 * Creates a fresh empty card object with all fields initialized.
 * Used when opening the Create modal or resetting form state.
 */
export function createEmptyCard(): Card {
  return {
    title: '',
    description: '',
    image_url: '',
    image_data: '',
    image_urls: [],
    tags: [],
    master_tag: '',
    urls: [],
    master_tag_data: {},
    document_data: '',
    document_name: ''
  };
}

/**
 * Creates an editable deep-clone of a source card.
 * Used when opening the Edit modal to avoid mutating the original.
 */
export function createEditCardFromSource(source: any): Card {
  return {
    id: source.id,
    title: source.title,
    description: source.description,
    image_url: source.image_url || '',
    image_data: source.image_data || '',
    image_urls: [...(source.image_urls || [])],
    tags: [...(source.tags || [])],
    master_tag: source.master_tag || 'note',
    urls: [...(source.urls || [])],
    master_tag_data: JSON.parse(JSON.stringify(source.master_tag_data || {})),
    document_data: source.document_data || '',
    document_name: source.document_name || ''
  };
}

/**
 * Assembles a card into an API payload ready for create/update requests.
 * Handles the image upload method branching (URL vs file).
 */
export function buildCardPayload(card: Card, imageMethod: string): any {
  const payload: any = {
    title: card.title,
    description: card.description,
    tags: card.tags,
    master_tag: card.master_tag,
    urls: card.urls,
    image_urls: card.image_urls || [],
    master_tag_data: card.master_tag_data,
    document_data: card.document_data || '',
    document_name: card.document_name || ''
  };

  if (imageMethod === 'url') {
    payload.image_url = card.image_url;
    payload.image_data = '';
  } else {
    payload.image_data = card.image_data;
    payload.image_url = '';
  }

  return payload;
}
