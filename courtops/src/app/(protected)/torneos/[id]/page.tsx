import { getTournament } from "@/actions/tournaments"
import { notFound } from "next/navigation"
import TournamentDetailClient from "./TournamentDetailClient"

interface Props {
       params: {
              id: string
       }
}

export default async function TournamentDetailPage({ params }: Props) {
       const tournament = await getTournament(params.id)

       if (!tournament) {
              notFound()
       }

       return <TournamentDetailClient tournament={tournament} />
}
