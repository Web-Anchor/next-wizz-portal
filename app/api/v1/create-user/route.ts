import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db/index';
import { users } from '@db/schema';
import { v4 as uuidv4 } from 'uuid';
import { handleIsRedirect } from '../auth-login/route';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  try {
    auth().protect();

    const redirect = handleIsRedirect(
      request.nextUrl.searchParams.get('redirect')
    );
    const { userId } = auth();
    const user = await currentUser();
    console.log('👤 Creating User record. Clerk User: ', user);

    await db
      .insert(users)
      .values({
        id: uuidv4(),
        clerkId: userId!,
        emailAddress: user?.emailAddresses?.[0]?.emailAddress!,
        firstName: user?.firstName,
        lastName: user?.lastName,
      })
      .returning({ id: users.id });
    console.log('👤 User record created successfully');

    return new Response(null, {
      status: 302,
      headers: {
        Location: APP_URL + (redirect ? redirect : '/dashboard'),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.error();
  }
}
