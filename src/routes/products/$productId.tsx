import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/products/$productId')({
  component: () => <Navigate to="/" />,
})
