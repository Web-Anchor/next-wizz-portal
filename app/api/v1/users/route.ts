import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { db } from '@db/index';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    auth().protect();

    const { userId } = auth();
    const dbUser = await db.select().from(users).where(eq(users.id, userId!));

    if (!dbUser) {
      redirect('/api/v1/auth/create');
    }

    redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return NextResponse.error();
  }
}
