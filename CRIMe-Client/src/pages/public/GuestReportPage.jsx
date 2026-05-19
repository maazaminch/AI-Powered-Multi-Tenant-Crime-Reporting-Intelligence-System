import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Construction, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

const GuestReportPage = () => {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 text-white">
            <Construction className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Guest incident reporting</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            This form is being built. Soon you will be able to report an incident
            without creating an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Planned fields</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Your name, email, and phone</li>
              <li>Region / tenant selection</li>
              <li>Crime type and description</li>
              <li>Map location picker</li>
              <li>Optional evidence uploads</li>
            </ul>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p>
              If you are in immediate danger, call emergency services first. Do
              not wait for this form.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link to="/register">Register as citizen instead</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/login">Already have an account? Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GuestReportPage
