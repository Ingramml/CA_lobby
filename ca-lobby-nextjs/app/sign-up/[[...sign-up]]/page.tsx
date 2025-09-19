import { SignUp } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join CA Lobby
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Get access to California lobbying data insights
          </p>
        </div>

        {/* Sign Up Card */}
        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Start analyzing California lobbying data today
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <SignUp
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
              afterSignUpUrl="/dashboard"
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign in here
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