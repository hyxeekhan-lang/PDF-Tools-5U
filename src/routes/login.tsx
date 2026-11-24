import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '#/components/AuthForm'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Sign in — PDF Pilot 5U' }, { name: 'description', content: 'Sign in to your PDF Pilot 5U account.' }] }),
  component: () => <AuthPage mode="login" />,
})
