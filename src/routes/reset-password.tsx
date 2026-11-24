import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '#/components/AuthForm'

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [{ title: 'Choose a new password — PDF Pilot 5U' }, { name: 'description', content: 'Set a new password for your PDF Pilot 5U account.' }] }),
  component: () => <AuthPage mode="reset" />,
})
