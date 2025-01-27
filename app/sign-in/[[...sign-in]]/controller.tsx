'use client';

import Wrapper, { SectionWrapper } from '@app/components/Wrapper';
import PageHeadings from '@app/components/PageHeadings';
import { Spinner } from '@app/components/Skeleton';
import { SignIn, useUser } from '@clerk/nextjs';
import Link from '@components/Link';
import { useRouter, useSearchParams } from 'next/navigation';
import { storeInSessionStorage } from '@helpers/index';

export default function Page() {
  const searchParams = useSearchParams()!;
  const redirect = searchParams.get('redirect');
  const id = searchParams.get('id');
  const router = useRouter();

  let { isSignedIn, user, isLoaded } = useUser();
  storeInSessionStorage(process.env.NEXT_PUBLIC_APP_URL!, { id });

  if (!isLoaded) {
    return (
      <Wrapper class="pt-5">
        <SectionWrapper class="items-center h-[400px] w-[400px]">
          <Spinner />
        </SectionWrapper>
      </Wrapper>
    );
  }

  if (isSignedIn) {
    router.push(`/dashboard?id=${id}`);
  }

  return (
    <Wrapper class="pt-5">
      <SectionWrapper class="items-center">
        <CardWrapper>
          <SignIn
            fallbackRedirectUrl={redirect || `/api/v1/auth?id=${id}`}
            path="/sign-in"
          />
        </CardWrapper>
        <SectionWrapper class="flex-row gap-5 w-[400px] text-nowrap items-center">
          <PageHeadings description="Don't have an account?" class="w-fit" />
          <Link
            href={`/sign-up`}
            className="bg-transparent items-center px-0 text-sm font-semibold text-indigo-600 shadow-none hover:bg-transparent hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign Up
          </Link>
        </SectionWrapper>
      </SectionWrapper>
    </Wrapper>
  );
}

export function CardWrapper(props: { children: React.ReactNode }) {
  return <section className="shadow-md rounded-2xl">{props.children}</section>;
}
