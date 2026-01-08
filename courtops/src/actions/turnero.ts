'use server'

import {
       getBookingsForDate as getB,
       getCourts as getC,
       getClubSettings as getS,
       getTurneroData as getT
} from './dashboard'

export async function getBookingsForDate(dateStr: string) {
       return await getB(dateStr)
}

export async function getCourts() {
       return await getC()
}

export async function getClubSettings() {
       return await getS()
}

export async function getTurneroData(dateStr: string) {
       return await getT(dateStr)
}
