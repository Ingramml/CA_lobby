import { SignIn } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to CA Lobby
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            California Lobbying Data Analysis Platform
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Access the California lobbying data dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                  card: 'border-0 shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'border border-gray-300 hover:bg-gray-50',
                  socialButtonsBlockButtonText: 'text-gray-700',
                  dividerLine: 'bg-gray-300',
                  dividerText: 'text-gray-500',
                  formFieldLabel: 'text-gray-700',
                  formFieldInput:
                    'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                  footerActionLink: 'text-blue-600 hover:text-blue-700',
                },
              }}
              redirectUrl="/dashboard"
              afterSignInUrl="/dashboard"
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign up here
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Return to home page
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}