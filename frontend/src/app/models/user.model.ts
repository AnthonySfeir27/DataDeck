/**
 * User Model
 * ----------
 * TypeScript interface for the User document.
 * Maps to the 'users' MongoDB collection.
 */
export interface User {
  id: string;
  username: string;
  email: string;
}
