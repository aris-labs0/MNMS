import { SignUp } from "../_components/sign-up"

export default async function LoginPage() {

    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-xl flex-col gap-6">
          <SignUp/>
        </div>
      </div>
    )
  }