export function normalizeComparablePhone(phone: string): string {
  let clean = phone.replace(/\D/g, '')

  if (clean.startsWith('0')) {
    clean = '54' + clean.slice(1)
  }

  if (!clean.startsWith('54') && clean.length <= 10) {
    clean = '54' + clean
  }

  return clean
}

export function getPhoneLastDigits(phone: string, length: number = 8): string {
  return phone.replace(/\D/g, '').slice(-length)
}

export function phoneMatches(input: string, candidate: string | null | undefined): boolean {
  if (!candidate) return false

  const normalizedInput = normalizeComparablePhone(input)
  const normalizedCandidate = normalizeComparablePhone(candidate)

  if (normalizedInput === normalizedCandidate) return true

  const inputDigits = input.replace(/\D/g, '')
  const candidateDigits = candidate.replace(/\D/g, '')

  return inputDigits.length > 0 && inputDigits === candidateDigits
}
