
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Initialize database connection
let db: ReturnType<typeof drizzle>;

try {
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql);
    console.log('✅ Database connected with Neon');
  } else {
    // Fallback for development - create mock database interface
    console.warn('⚠️ No DATABASE_URL found, using mock database');
    const mockSql = () => Promise.resolve([]);
    db = {
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: () => ({
                offset: () => Promise.resolve([])
              })
            })
          })
        })
      }),
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([{
            id: Math.floor(Math.random() * 1000),
            referenceId: 'MOCK_' + Date.now().toString(36).toUpperCase(),
            status: 'submitted',
            submittedAt: new Date(),
            updatedAt: new Date()
          }])
        })
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([])
          })
        })
      })
    } as any;
  }
} catch (error) {
  console.error('❌ Database connection failed:', error);
  throw new Error('Database initialization failed');
}

export { db };
