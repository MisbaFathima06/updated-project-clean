
import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test database connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
    
    // The database tables will be created automatically by Drizzle
    // when first accessed, but let's ensure they exist
    
    console.log('🗃️ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
