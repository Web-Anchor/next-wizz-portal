import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db/index';
import { users } from '@db/schema';
import { v4 as uuidv4 } from 'uuid';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  auth().protect();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const { userId } = auth();
    const user = await currentUser();
    console.log('👤 Creating User record. Clerk data: ', user?.id, id);

    await db
      .insert(users)
      .values({
        id: uuidv4(),
        clerkId: userId!,
        emailAddress: user?.emailAddresses?.[0]?.emailAddress!,
        firstName: user?.firstName,
        lastName: user?.lastName,
        type: 'platform',
      })
      .returning({ id: users.id });
    console.log('👤 User record created successfully 🙌');

    return new Response(null, {
      status: 302,
      headers: {
        Location: APP_URL + `/dashboard?id=${id}`,
      },
    });
  } catch (error: any) {
    console.error(error);

    return new Response(null, {
      status: 302,
      headers: {
        Location: APP_URL + `/sign-in?id=${id}`,
      },
    });
  }
}
