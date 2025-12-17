export function formatGuatemalaPhone(phone: string | null | undefined): string {
  if (!phone) return '-'
  
  const digits = phone.replace(/\D/g, '')
  
  if (digits.length !== 8) return phone
  
  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function validateGuatemalaPhone(phone: string): boolean {
  if (!phone) return true
  const digits = phone.replace(/\D/g, '')
  return /^[2-7]\d{7}$/.test(digits)
}
