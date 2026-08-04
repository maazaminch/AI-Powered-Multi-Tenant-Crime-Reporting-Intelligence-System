// import React from 'react'
// import { Link } from 'react-router-dom'
// import {
//   Shield,
//   FileWarning,
//   MapPin,
//   Bell,
//   AlertTriangle,
//   ArrowRight,
//   UserPlus,
//   LogIn,
// } from 'lucide-react'
// import { Button } from '../../components/ui/Button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

// const steps = [
//   {
//     icon: FileWarning,
//     title: 'Report an incident',
//     description:
//       'Submit details as a registered citizen or use guest reporting without creating an account.',
//   },
//   {
//     icon: MapPin,
//     title: 'Location & evidence',
//     description:
//       'Pin the incident on a map and attach supporting information for investigators.',
//   },
//   {
//     icon: Bell,
//     title: 'Track your case',
//     description:
//       'Registered citizens receive updates as police review and progress the report.',
//   },
//   {
//     icon: Shield,
//     title: 'Secure handling',
//     description:
//       'Reports are routed to the correct tenant jurisdiction with role-based access control.',
//   },
// ]

// const safetyTips = [
//   'If you are in immediate danger, call your local emergency number first.',
//   'Do not confront suspects or enter unsafe areas to gather evidence.',
//   'Provide accurate contact details so authorities can follow up when needed.',
//   'Guest reports are reviewed by the appropriate regional office.',
// ]

// const HomePage = () => {
//   return (
//     <div>
//       {/* Hero */}
//       <section className="relative overflow-hidden bg-slate-950 text-white">
//         <div
//           className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"
//           aria-hidden
//         />
//         <div className="container relative mx-auto px-4 py-20 sm:px-6 sm:py-28">
//           <div className="mx-auto max-w-3xl text-center">
//             <p className="mb-4 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
//               Citizen-first crime reporting platform
//             </p>
//             <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
//               Report crimes safely.{' '}
//               <span className="text-blue-400">Help your community.</span>
//             </h1>
//             <p className="mt-6 text-lg text-white/70 sm:text-xl">
//               CRIMe connects citizens with law enforcement through structured
//               incident reports, real-time routing, and secure case management —
//               without exposing internal staff registration to the public.
//             </p>

//             <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
//               <Button
//                 asChild
//                 size="lg"
//                 className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
//               >
//                 <Link to="/report">
//                   <AlertTriangle className="mr-2 h-5 w-5" />
//                   Report as Guest
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 size="lg"
//                 variant="outline"
//                 className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
//               >
//                 <Link to="/register">
//                   <UserPlus className="mr-2 h-5 w-5" />
//                   Register as Citizen
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 size="lg"
//                 variant="outline"
//                 className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
//               >
//                 <Link to="/login">
//                   <LogIn className="mr-2 h-5 w-5" />
//                   Login
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Emergency CTA */}
//       <section className="border-b bg-red-50 dark:bg-red-950/20">
//         <div className="container mx-auto flex flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
//           <div className="flex items-start gap-3">
//             <div className="rounded-full bg-red-600 p-2 text-white">
//               <AlertTriangle className="h-5 w-5" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
//                 Emergency?
//               </h2>
//               <p className="mt-1 text-sm text-red-800/80 dark:text-red-200/80">
//                 For life-threatening situations, contact emergency services
//                 immediately. Use guest reporting for non-emergency incidents
//                 that still require official follow-up.
//               </p>
//             </div>
//           </div>
//           <Button asChild className="shrink-0 bg-red-600 hover:bg-red-700">
//             <Link to="/report">
//               Start guest report
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Link>
//           </Button>
//         </div>
//       </section>

//       {/* Intro */}
//       <section className="container mx-auto px-4 py-16 sm:px-6">
//         <div className="mx-auto max-w-3xl text-center">
//           <h2 className="text-3xl font-bold tracking-tight">Introduction</h2>
//           <p className="mt-4 text-muted-foreground">
//             CRIMe (Crime Reporting & Investigation Management) is a multi-tenant
//             platform built for regional law enforcement. Citizens can report
//             incidents online, while police and administrators work cases inside
//             secure, role-based dashboards. Your report reaches the right
//             jurisdiction quickly and is handled with accountability.
//           </p>
//         </div>
//       </section>

//       {/* How it works */}
//       <section className="bg-muted/40 py-16">
//         <div className="container mx-auto px-4 sm:px-6">
//           <div className="mb-12 text-center">
//             <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
//             <p className="mt-3 text-muted-foreground">
//               A simple path from report to resolution
//             </p>
//           </div>
//           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//             {steps.map((step, index) => (
//               <Card key={step.title} className="border bg-card">
//                 <CardHeader>
//                   <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//                     <step.icon className="h-5 w-5" />
//                   </div>
//                   <p className="text-xs font-medium text-muted-foreground">
//                     Step {index + 1}
//                   </p>
//                   <CardTitle className="text-lg">{step.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <CardDescription className="text-sm leading-relaxed">
//                     {step.description}
//                   </CardDescription>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Safety */}
//       <section className="container mx-auto px-4 py-16 sm:px-6">
//         <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Safety information</h2>
//             <p className="mt-4 text-muted-foreground">
//               Your safety comes first. Follow these guidelines when using the
//               platform.
//             </p>
//             <ul className="mt-6 space-y-3">
//               {safetyTips.map((tip) => (
//                 <li key={tip} className="flex gap-3 text-sm">
//                   <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
//                   <span>{tip}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
//             <CardHeader>
//               <CardTitle>Get started</CardTitle>
//               <CardDescription>
//                 Choose how you want to interact with CRS
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button asChild className="w-full justify-start" variant="default">
//                 <Link to="/report">
//                   Guest reporting — no account required
//                   <ArrowRight className="ml-auto h-4 w-4" />
//                 </Link>
//               </Button>
//               <Button asChild className="w-full justify-start" variant="outline">
//                 <Link to="/register">
//                   Create a citizen account
//                   <ArrowRight className="ml-auto h-4 w-4" />
//                 </Link>
//               </Button>
//               <Button asChild className="w-full justify-start" variant="outline">
//                 <Link to="/login">
//                   Sign in to your account
//                   <ArrowRight className="ml-auto h-4 w-4" />
//                 </Link>
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </section>
//     </div>
//   )
// }

// export default HomePage

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
  FileWarning,
  MapPin,
  Bell,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  LogIn,
  Search,
  Ticket,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'


const steps = [
  {
    tag: 'CASE-01',
    icon: FileWarning,
    title: 'Report an incident',
    description:
      'Submit details as a registered citizen or use guest reporting without creating an account.',
  },
  {
    tag: 'CASE-02',
    icon: MapPin,
    title: 'Location & evidence',
    description:
      'Pin the incident on a map and attach supporting information for investigators.',
  },
  {
    tag: 'CASE-03',
    icon: Bell,
    title: 'Track your case',
    description:
      'Registered citizens receive updates as police review and progress the report.',
  },
  {
    tag: 'CASE-04',
    icon: Shield,
    title: 'Secure handling',
    description:
      'Reports are routed to the correct tenant jurisdiction with role-based access control.',
  },
]

const safetyTips = [
  'If you are in immediate danger, call 15 first — do not wait to file a report.',
  'Do not confront suspects or enter unsafe areas to gather evidence.',
  'Provide accurate contact details so authorities can follow up when needed.',
  'Guest reports are reviewed by the appropriate regional office.',
]

const HomePage = () => {

  return (
    <div className="bg-[#F6F4EF]">
      {/* Hero — the "case cover" */}
      <section className="relative overflow-hidden bg-[#0B1220] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 27px, #ffffff 28px)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#3E6FF2]/20 blur-3xl"
          aria-hidden
        />

        <div className="container relative mx-auto px-4 pb-24 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#E3A008]">
              <span className="h-px w-8 bg-[#E3A008]/50" />
              CRIMe · Case Management System
              <span className="h-px w-8 bg-[#E3A008]/50" />
            </div>

            <h1 className="text-center font-sans text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Report crimes safely.{' '}
              <span className="text-[#E3A008]">Help your community.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-white/60">
              CRIMe connects citizens with law enforcement through structured
              incident reports, real-time routing, and secure case management —
              without exposing internal staff registration to the public.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-[#E3A008] text-[#0B1220] hover:bg-[#c78e07] sm:w-auto"
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
                variant="ghost"
                className="w-full text-white/70 hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link to="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="w-full border border-[#E3A008]/30 text-[#E3A008] hover:bg-[#E3A008]/10 hover:text-[#E3A008] sm:w-auto"
              >
                <Link to="/public/track">
                  <Ticket className="mr-2 h-5 w-5" />
                  Track Case
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-white/40">
              Citizens: log in to see all your cases. Guests: track a case below.
            </p>
          </div>
        </div>

      </section> 

      {/* spacer to absorb the overlapping card */}
      <div className="h-28 sm:h-24" />

      {/* Emergency CTA */}
      <section className="border-y border-[#0B1220]/5 bg-red-200">
        <div className="container mx-auto flex flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-600 p-2 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                Emergency?
              </h2>
              <p className="mt-1 text-sm text-red-800/80">
                If you or someone else is in immediate danger, do not use
                this website. Call the police helpline right now.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-red-600 hover:bg-red-700">
            <a href="tel:15">
              <Phone className="mr-2 h-4 w-4" />
              Call 15
            </a>
          </Button>
        </div>
      </section>

      {/* Intro */}
      <section className="container mx-auto px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#3E6FF2]">
            Introduction
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#101826]">
            Built for regional law enforcement
          </h2>
          <p className="mt-4 leading-relaxed text-[#101826]/60">
            CRIMe (Crime Reporting & Investigation Management) is a multi-tenant
            platform built for regional law enforcement. Citizens can report
            incidents online, while police and administrators work cases inside
            secure, role-based dashboards. Your report reaches the right
            jurisdiction quickly and is handled with accountability.
          </p>
        </div>
      </section>

      {/* How it works — a real sequence, so case-number style markers earn their keep */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#3E6FF2]">
              The process
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#101826]">
              How it works
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border border-[#0B1220]/10 bg-[#0B1220]/10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.title} className="bg-white p-6 transition-colors hover:bg-[#F6F4EF]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1220] text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-[#101826]/30">
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#101826]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#101826]/55">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety + Get started */}
      <section className="container mx-auto px-4 py-16 sm:px-6 bg-gray-200">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#3E6FF2]">
              Before you begin
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#101826]">
              Safety information
            </h2>
            <p className="mt-4 text-[#101826]/60">
              Your safety comes first. Follow these guidelines when using the
              platform.
            </p>
            <ul className="mt-6 space-y-4">
              {safetyTips.map((tip) => (
                <li key={tip} className="flex gap-3 border-l-2 border-[#E3A008] pl-4 text-sm text-[#101826]/75">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <Card className="border-[#0B1220]/10 bg-[#0B1220] text-white">
            <CardHeader>
              <CardTitle className="text-white">Get started</CardTitle>
              <CardDescription className="text-white/50">
                Choose how you want to interact with CRIMe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start bg-[#E3A008] text-[#0B1220] hover:bg-[#c78e07]">
                <Link to="/report">
                  Guest reporting — no account required
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-start border-white/15 bg-white/5 text-white hover:bg-white/10" variant="outline">
                <Link to="/register">
                  Create a citizen account
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-start border-white/15 bg-white/5 text-white hover:bg-white/10" variant="outline">
                <Link to="/login">
                  Sign in to your account
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-start border-white/15 bg-white/5 text-white hover:bg-white/10" variant="outline">
                <Link to="/public/track">
                  <Ticket className="mr-2 h-4 w-4" />
                  Track an existing case
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