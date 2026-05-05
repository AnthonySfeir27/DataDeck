/**
 * Tag Model
 * ---------
 * TypeScript interface for the Tag document.
 * Maps to the 'tags' MongoDB collection.
 */
export interface Tag {
  id: string;
  name: string;
  created_at?: string;
}
