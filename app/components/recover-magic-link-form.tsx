'use client'
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { CheckCircle2, Loader2 } from 'lucide-react'

export function RecoverMagicLinkForm() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/recover-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mb-3 flex justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <p className="font-medium text-green-800">
          Link wysłany!
        </p>
        <p className="mt-1 text-sm text-green-700">
          Jeśli dane są poprawne, link został wysłany na podany email.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          required
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Numer telefonu</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="123 456 789"
          required
          className="h-11"
        />
      </div>

      {status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Wystąpił błąd. Sprawdź dane i spróbuj ponownie.
        </div>
      )}

      <Button
        type="submit"
        className="h-11 w-full bg-indigo-600 font-semibold hover:bg-indigo-700"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wysyłanie...
          </>
        ) : (
          'Wyślij link'
        )}
      </Button>
    </form>
  )
}
