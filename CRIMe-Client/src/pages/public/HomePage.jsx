import React from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  FileWarning,
  MapPin,
  Bell,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

const steps = [
  {
    icon: FileWarning,
    title: 'Report an incident',
    description:
      'Submit details as a registered citizen or use guest reporting without creating an account.',
  },
  {
    icon: MapPin,
    title: 'Location & evidence',
    description:
      'Pin the incident on a map and attach supporting information for investigators.',
  },
  {
    icon: Bell,
    title: 'Track your case',
    description:
      'Registered citizens receive updates as police review and progress the report.',
  },
  {
    icon: Shield,
    title: 'Secure handling',
    description:
      'Reports are routed to the correct tenant jurisdiction with role-based access control.',
  },
]

const safetyTips = [
  'If you are in immediate danger, call your local emergency number first.',
  'Do not confront suspects or enter unsafe areas to gather evidence.',
  'Provide accurate contact details so authorities can follow up when needed.',
  'Guest reports are reviewed by the appropriate regional office.',
]

const HomePage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"
          aria-hidden
        />
        <div className="container relative mx-auto px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
              Citizen-first crime reporting platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Report crimes safely.{' '}
              <span className="text-blue-400">Help your community.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 sm:text-xl">
              CRIMe connects citizens with law enforcement through structured
              incident reports, real-time routing, and secure case management —
              without exposing internal staff registration to the public.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
              >
                <Link to="/report">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Report as Guest
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link to="/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register as Citizen
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link to="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="border-b bg-red-50 dark:bg-red-950/20">
        <div className="container mx-auto flex flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-600 p-2 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Emergency?
              </h2>
              <p className="mt-1 text-sm text-red-800/80 dark:text-red-200/80">
                For life-threatening situations, contact emergency services
                immediately. Use guest reporting for non-emergency incidents
                that still require official follow-up.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-red-600 hover:bg-red-700">
            <Link to="/report">
              Start guest report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Intro */}
      <section className="container mx-auto px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Introduction</h2>
          <p className="mt-4 text-muted-foreground">
            CRIMe (Crime Reporting & Investigation Management) is a multi-tenant
            platform built for regional law enforcement. Citizens can report
            incidents online, while police and administrators work cases inside
            secure, role-based dashboards. Your report reaches the right
            jurisdiction quickly and is handled with accountability.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              A simple path from report to resolution
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Card key={step.title} className="border bg-card">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="container mx-auto px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Safety information</h2>
            <p className="mt-4 text-muted-foreground">
              Your safety comes first. Follow these guidelines when using the
              platform.
            </p>
            <ul className="mt-6 space-y-3">
              {safetyTips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle>Get started</CardTitle>
              <CardDescription>
                Choose how you want to interact with CRIMe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="default">
                <Link to="/report">
                  Guest reporting — no account required
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/register">
                  Create a citizen account
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/login">
                  Sign in to your account
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default HomePage
