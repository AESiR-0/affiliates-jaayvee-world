import { db } from '@/db';
import { affiliates, users, roles } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Test database connection
    const result = await db.execute('SELECT 1 as test');
    
    // Try to get some data
    const affiliateCount = await db.select().from(affiliates).limit(1);
    const userCount = await db.select().from(users).limit(1);
    const roleCount = await db.select().from(roles).limit(1);
    
    return Response.json({
      success: true,
      message: 'Database connection successful',
      data: {
        testQuery: result,
        affiliateCount: affiliateCount.length,
        userCount: userCount.length,
        roleCount: roleCount.length,
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return Response.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
