'use server'

import { checkSetupStatus } from "@/actions/setup"
import { redirect } from "next/navigation"
import { SetupWizard } from "@/components/setup/SetupWizard"

export default async function SetupPage() {
       const status = await checkSetupStatus()
       if (status.isSetup) {
              redirect('/dashboard')
       }

       return <SetupWizard initialData={status} />
}
