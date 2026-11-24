import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '#/components/AuthForm'

export const Route = createFileRoute('/forgot-password')({
  head: () => ({ meta: [{ title: 'Reset password — PDF Pilot 5U' }, { name: 'description', content: 'Request a secure password reset for your PDF Pilot 5U account.' }] }),
  component: () => <AuthPage mode="forgot" />,
})
