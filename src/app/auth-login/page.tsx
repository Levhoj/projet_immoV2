/**
 * Page de connexion / inscription via Clerk.
 * Clerk gère tout automatiquement : email, Google, GitHub, MFA, etc.
 * 
 * Note : ce fichier doit être dans un dossier nommé (auth) dans Next.js
 * pour être un "Route Group" sans segment URL. Renommer le dossier
 * auth-login → (auth) lors de l'installation.
 */
import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignIn />
    </div>
  )
}
