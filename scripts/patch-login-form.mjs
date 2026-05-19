import fs from 'node:fs'

const path = 'components/shared/auth/login-form.tsx'

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
  "import { routes } from '@/src/config/routes'",
  `import { routes } from '@/src/config/routes'
import { authClient, signIn, signOut } from '@/src/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/src/lib/auth/auth-errors'
import { loginSchema } from '@/src/lib/auth/auth-schemas'
import {
  assertAdminAccessAction,
  ensureCustomerRoleAction,
} from '@/src/server/auth/actions'`,
)

const oldBlock =
  /interface LoginFormData[\s\S]*?console\.log\('Google login clicked - integration pending'\)\r?\n  \}/

const newBlock = `type LoginFormVariant = 'storefront' | 'admin'

interface LoginFormProps {
  className?: string
  variant?: LoginFormVariant
  googleEnabled?: boolean
  defaultCallbackUrl?: string
}

export function LoginForm({
  className,
  variant = 'storefront',
  googleEnabled = false,
  defaultCallbackUrl,
}: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackFromQuery = searchParams.get('callbackUrl')
  const errorFromQuery = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(() => {
    if (errorFromQuery === 'forbidden') {
      return 'No tienes permisos para acceder al dashboard.'
    }
    return null
  })
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)

  const isAdmin = variant === 'admin'
  const defaultRedirect = isAdmin ? routes.adminDashboard : routes.account
  const callbackURL =
    defaultCallbackUrl ?? callbackFromQuery ?? defaultRedirect

  const resolveRedirect = () => {
    if (callbackURL.startsWith('/')) {
      return callbackURL
    }
    return defaultRedirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setForgotMessage(null)
    setIsLoading(true)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Datos inválidos')
      setIsLoading(false)
      return
    }

    const result = await signIn.email({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      callbackURL: resolveRedirect(),
      rememberMe,
    })

    if (result.error) {
      setError(
        getAuthErrorMessage(
          result.error,
          'Correo o contraseña incorrectos.',
        ),
      )
      setIsLoading(false)
      return
    }

    if (!isAdmin) {
      await ensureCustomerRoleAction()
    } else {
      const adminCheck = await assertAdminAccessAction()
      if (!adminCheck.ok) {
        await signOut()
        setError(adminCheck.message)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(false)
    router.push(resolveRedirect())
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    if (!googleEnabled) {
      setError(
        'Google no está configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el entorno.',
      )
      return
    }

    setError(null)
    setForgotMessage(null)
    setIsGoogleLoading(true)

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: resolveRedirect(),
      })
    } catch (err) {
      setError(
        getAuthErrorMessage(err, 'No se pudo iniciar sesión con Google.'),
      )
      setIsGoogleLoading(false)
    }
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    setForgotMessage(
      'La recuperación de contraseña estará disponible pronto.',
    )
  }

  const busy = isLoading || isGoogleLoading`

if (!oldBlock.test(s)) {
  console.error('Block not found')
  process.exit(1)
}

s = s.replace(oldBlock, newBlock)

s = s.replace(
  'Bienvenido de vuelta',
  "{isAdmin ? 'Panel de administración' : 'Bienvenido de vuelta'}",
)
s = s.replace(
  'Inicia sesión para acceder a tu cuenta',
  "{isAdmin ? 'Inicia sesión con tu cuenta de administrador' : 'Inicia sesión para acceder a tu cuenta'}",
)

s = s.replace(
  `      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}`,
  `      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {forgotMessage && (
        <Alert className="border-border bg-muted/50">
          <AlertDescription className="font-serif">{forgotMessage}</AlertDescription>
        </Alert>
      )}`,
)

s = s.replaceAll('formData.email', 'email')
s = s.replaceAll('formData.password', 'password')
s = s.replaceAll('formData.rememberMe', 'rememberMe')
s = s.replaceAll(
  'setFormData({ ...formData, email: e.target.value })',
  'setEmail(e.target.value)',
)
s = s.replaceAll(
  'setFormData({ ...formData, password: e.target.value })',
  'setPassword(e.target.value)',
)
s = s.replaceAll(
  'setFormData({ ...formData, rememberMe: checked as boolean })',
  'setRememberMe(checked === true)',
)
s = s.replaceAll('disabled={isLoading}', 'disabled={busy}')

s = s.replace(
  `<Link 
              href={routes.login} 
              className="font-serif text-xs text-accent hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>`,
  `<button
              type="button"
              onClick={handleForgotPassword}
              className="font-serif text-xs text-accent hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>`,
)

s = s.replace(
  `        onClick={handleGoogleLogin}
        disabled={isLoading}`,
  `        onClick={handleGoogleLogin}
        disabled={busy || !googleEnabled}
        title={
          !googleEnabled
            ? 'Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET'
            : undefined
        }`,
)

s = s.replace(
  'Continuar con Google',
  `{isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          'Iniciar sesión con Google'
        )}`,
)

s = s.replace(
  `      {/* Register Link */}
      <p className="text-center font-serif text-sm text-muted-foreground">
        No tienes cuenta?{' '}
        <Link href={routes.register} className="font-sans font-medium text-accent hover:underline">
          Crear cuenta
        </Link>
      </p>`,
  `      {!isAdmin && (
        <p className="text-center font-serif text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link href={routes.register} className="font-sans font-medium text-accent hover:underline">
            Crear cuenta
          </Link>
        </p>
      )}`,
)

// Remove duplicate export function line if any
s = s.replace(
  /export function LoginForm\(\{ className, onSuccess \}: LoginFormProps\) \{[\s\S]*?export function LoginForm/,
  'export function LoginForm',
)

fs.writeFileSync(path, s, { encoding: 'utf8' })
console.log('patched login-form')
