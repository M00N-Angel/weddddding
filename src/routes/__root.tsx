import { createRootRoute, Outlet } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  component: RootDocument,
})

function RootDocument() {
  return <Outlet />
}
