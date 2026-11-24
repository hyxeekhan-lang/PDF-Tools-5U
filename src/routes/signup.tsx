import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '#/components/AuthForm'

export const Route = createFileRoute('/signup')({
  head: () => ({ meta: [{ title: 'Create account — PDF Pilot 5U' }, { name: 'description', content: 'Create a PDF Pilot 5U account.' }] }),
  component: () => <AuthPage mode="signup" />,
})
