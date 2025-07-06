import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { usersTable } from './db/schema';

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const users = await db.select().from(usersTable);
    console.log('✅ Database connection successful!');
    console.log('Current users:', users);
    
    // Optional: Create a test user
    const user: typeof usersTable.$inferInsert = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };
    
    // Comment out the insert for now to avoid duplicates
    // await db.insert(usersTable).values(user);
    // console.log('New user created!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

main(); 