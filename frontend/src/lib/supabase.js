// Supabase to Firebase migration compatibility bridge
// Deprecated: Supabase has been replaced with Firebase (authService and dbService) in src/lib/firebase.js

import { authService, dbService } from './firebase';

export { authService, dbService };
export default { authService, dbService };
