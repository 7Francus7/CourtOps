import { getTournament } from "@/actions/tournaments"
import { notFound } from "next/navigation"
import TournamentDetailClient from "./TournamentDetailClient"

interface Props {
       params: {
              id: string
       }
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
       const resolvedParams = await params
       const tournament = await getTournament(resolvedParams.id)

       if (!tournament) {
              notFound()
       }

       return <TournamentDetailClient tournament={tournament} />
}
