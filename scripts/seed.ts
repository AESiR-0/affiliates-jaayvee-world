import { db } from '../db';
import { users, roles, ventures, affiliates, affiliateLinks } from '../db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create affiliate role if it doesn't exist
    let affiliateRole;
    try {
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, 'affiliate'))
        .limit(1);

      if (!existingRole) {
        [affiliateRole] = await db
          .insert(roles)
          .values({
            name: 'affiliate',
            level: 20,
          })
          .returning();
        console.log('✅ Created affiliate role');
      } else {
        affiliateRole = existingRole;
        console.log('✅ Affiliate role already exists');
      }
    } catch (error) {
      console.log('⚠️  Could not check/create affiliate role, continuing...');
      // Create a mock role object for the rest of the script
      affiliateRole = { id: 'temp-role-id' };
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    let testUser;
    try {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'affiliate@example.com'))
        .limit(1);

      if (!existingUser) {
        [testUser] = await db
          .insert(users)
          .values({
            email: 'affiliate@example.com',
            password: hashedPassword,
            fullName: 'Test Affiliate',
            roleId: affiliateRole.id,
            isActive: true,
          })
          .returning();
        console.log('✅ Created test user');
      } else {
        testUser = existingUser;
        console.log('✅ Test user already exists');
      }
    } catch (error) {
      console.log('⚠️  Could not create test user, skipping...');
      return;
    }

    // Create test venture (brand)
    const [existingVenture] = await db
      .select()
      .from(ventures)
      .where(eq(ventures.name, 'Talaash Events'))
      .limit(1);

    let testVenture;
    if (!existingVenture) {
      [testVenture] = await db
        .insert(ventures)
        .values({
          name: 'Talaash Events',
          type: 'events',
          ownerId: testUser.id,
          description: 'Premium event management and ticketing platform',
        })
        .returning();
      console.log('✅ Created test venture');
    } else {
      testVenture = existingVenture;
      console.log('✅ Test venture already exists');
    }

    // Create affiliate record
    const [existingAffiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, testUser.id))
      .limit(1);

    let affiliate;
    if (!existingAffiliate) {
      [affiliate] = await db
        .insert(affiliates)
        .values({
          userId: testUser.id,
          code: 'AFF' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          name: 'Test Affiliate',
          email: 'affiliate@example.com',
        })
        .returning();
      console.log('✅ Created affiliate record');
    } else {
      affiliate = existingAffiliate;
      console.log('✅ Affiliate record already exists');
    }

    // Create affiliate link
    const [existingAffiliateLink] = await db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.affiliateId, affiliate.id))
      .limit(1);

    if (!existingAffiliateLink) {
      await db
        .insert(affiliateLinks)
        .values({
          affiliateId: affiliate.id,
          ventureId: testVenture.id,
          linkCode: 'LINK' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          originalUrl: 'https://talaash.thejaayveeworld.com/events',
          shortUrl: 'https://talaash.thejaayveeworld.com/r/' + affiliate.code,
          isActive: true,
        });
      console.log('✅ Created affiliate link');
    } else {
      console.log('✅ Affiliate link already exists');
    }

    console.log('🎉 Database seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Email: affiliate@example.com');
    console.log('Password: password123');
    console.log(`Affiliate Code: ${affiliate.code}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
