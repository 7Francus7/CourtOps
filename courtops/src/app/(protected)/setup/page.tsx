import { redirect } from "next/navigation"

// El setup inicial ahora vive en el OnboardingWizard del dashboard
// (se muestra automáticamente cuando el club no tiene canchas o precios).
// Esta ruta queda solo para no romper links viejos.
export default function SetupPage() {
       redirect('/dashboard')
}
