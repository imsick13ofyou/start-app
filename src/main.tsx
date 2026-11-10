import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  MantineProvider,
  createTheme,
  defaultVariantColorsResolver,
} from '@mantine/core'
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import '@mantine/core/styles.css'
import './index.css'
import {
  Completion,
  Layout,
  Lesson,
  NotFound,
  Reference,
  Roadmap,
  Welcome,
} from './App'
import { ProgressProvider } from './app/progress'

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFound,
})
const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Welcome,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/roadmap',
    component: Roadmap,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/lesson/$pointId',
    component: Lesson,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/completion',
    component: Completion,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/reference',
    component: Reference,
  }),
])
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultViewTransition: {
    types: ({ fromLocation, toLocation }) =>
      fromLocation?.pathname.startsWith('/lesson/') &&
      toLocation.pathname.startsWith('/lesson/')
        ? false
        : [],
  },
})
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
const theme = createTheme({
  fontFamily: 'Inter, Segoe UI, sans-serif',
  defaultRadius: 'md',
  variantColorResolver: (input) => {
    const colors = defaultVariantColorsResolver(input)
    return input.variant === 'filled'
      ? { ...colors, color: 'var(--on-primary)' }
      : colors
  },
})
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ProgressProvider>
        <RouterProvider router={router} />
      </ProgressProvider>
    </MantineProvider>
  </StrictMode>,
)
