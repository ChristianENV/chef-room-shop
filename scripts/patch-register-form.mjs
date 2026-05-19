import fs from 'node:fs'

const path = 'src/features/storefront/auth/register-form.tsx'

function readText(filePath) {
  const buf = fs.readFileSync(filePath)
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString('utf16le')
  }
  return buf.toString('utf8').replace(/^\uFEFF/, '')
}

let s = readText(path)

s = s.replace(
  "import { useRouter } from 'next/navigation'",
  "import { useRouter, useSearchParams } from 'next/navigation'",
)

s = s.replace(
  "import { cn } from '@/lib/utils'",
  `import { cn } from '@/lib/utils'
import { authClient, signUp } from '@/src/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/src/lib/auth/auth-errors'
import { registerSchema } from '@/src/lib/auth/auth-schemas'
import { ensureCustomerRoleAction } from '@/src/server/auth/actions'`,
)

const oldBlock =
  /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?console\.log\('Google register clicked - integration pending'\)\r?\n  \}/

const newBlock = `const searchParams = useSearchParams()
  const callbackFromQuery = searchParams.get('callbackUrl')
  const defaultRedirect = routes.account
  const callbackURL = callbackFromQuery ?? defaultRedirect

  const resolveRedirect = () => {
    if (callbackURL.startsWith('/')) return callbackURL
    return defaultRedirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const parsed = registerSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms: formData.acceptTerms,
      acceptMarketing: formData.acceptMarketing,
    })

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Datos inválidos')
      setIsLoading(false)
      return
    }

    const name = \`\${parsed.data.firstName} \${parsed.data.lastName}\`.trim()

    const result = await signUp.email({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      name,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      marketingOptIn: parsed.data.acceptMarketing ?? false,
      callbackURL: resolveRedirect(),
    })

    if (result.error) {
      setError(
        getAuthErrorMessage(
          result.error,
          'No se pudo crear la cuenta. Verifica los datos.',
        ),
      )
      setIsLoading(false)
      return
    }

    await ensureCustomerRoleAction()

    setIsLoading(false)
    setSuccess(true)

    setTimeout(() => {
      onSuccess?.()
      router.push(resolveRedirect())
      router.refresh()
    }, 1200)
  }

  const handleGoogleRegister = async () => {
    setError(null)
    setIsGoogleLoading(true)

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: resolveRedirect(),
      })
    } catch (err) {
      setError(
        getAuthErrorMessage(err, 'No se pudo registrarse con Google.'),
      )
      setIsGoogleLoading(false)
    }
  }`

// Insert isGoogleLoading state
if (!s.includes('isGoogleLoading')) {
  s = s.replace(
    'const [isLoading, setIsLoading] = useState(false)',
    `const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)`,
  )
}

if (!oldBlock.test(s)) {
  // try without google handler at end - match up to handleGoogleRegister mock
  const alt =
    /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?\}, 2000\)\r?\n  \}\r?\n\r?\n  const handleGoogleRegister/
  if (!alt.test(s)) {
    console.error('register block not found')
    process.exit(1)
  }
  s = s.replace(alt, newBlock + '\n\n  const handleGoogleRegister')
} else {
  s = s.replace(oldBlock, newBlock)
}

s = s.replaceAll('disabled={isLoading}', 'disabled={isLoading || isGoogleLoading}')

s = s.replace(
  `        onClick={handleGoogleRegister}
        disabled={isLoading || isGoogleLoading}`,
  `        onClick={handleGoogleRegister}
        disabled={isLoading || isGoogleLoading}
        title="Registrarse con Google"`,
)

s = s.replace(
  'Registrarse con Google',
  `{isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          'Registrarse con Google'
        )}`,
)

fs.writeFileSync(path, s, { encoding: 'utf8' })
console.log('patched register-form')
