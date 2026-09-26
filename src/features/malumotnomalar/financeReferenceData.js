import { dmyToIso, formatDate, formatDateTime, formatNumber, formatUzPhone } from '@/lib/format'

function mapMeta(raw) {
  return {
    yaratilgan: raw.created_at ? formatDateTime(new Date(raw.created_at)) : '',
    ozgartirilgan: raw.updated_at ? formatDateTime(new Date(raw.updated_at)) : '',
  }
}

// ── Valyutalar ──
export function mapCurrency(raw) {
  return { id: raw.id, name: raw.name ?? '', shortName: raw.short_name ?? '', ...mapMeta(raw) }
}

export function buildCurrencyPayload(draft) {
  return { name: draft.name.trim(), short_name: draft.shortName.trim().toUpperCase() }
}

// ── Kurslar (CurrencyLedger) ──
export function mapCurrencyLedger(raw) {
  const currencyName = raw.currency_info?.name ?? ''
  const currencyShort = raw.currency_info?.short_name ?? ''
  const valyutaLabel =
    currencyName && currencyShort
      ? `${currencyName} (${currencyShort})`
      : currencyName || currencyShort || ''

  return {
    id: raw.id,
    currencyId: raw.currency_info?.id ?? (typeof raw.currency === 'string' ? raw.currency : ''),
    currencyInfo: raw.currency_info,
    valyuta: valyutaLabel,
    value: raw.value != null ? String(raw.value) : '',
    kursFormatted: raw.value != null ? `${formatNumber(raw.value, 2)} UZS` : '',
    day: raw.day ? formatDate(raw.day) : '',
    rawDay: raw.day ?? '',
    ...mapMeta(raw),
  }
}

export function buildCurrencyLedgerPayload(draft) {
  const dayIso = draft.day?.includes('.')
    ? dmyToIso(draft.day)
    : draft.day || new Date().toISOString().slice(0, 10)
  const cleanValue = String(draft.value ?? '')
    .replace(/\s/g, '')
    .replace(',', '.')

  return {
    currency: draft.currencyId,
    day: dayIso,
    value: cleanValue,
  }
}

// ── Hisoblash va ushlab qolish turlari ──
export const ACCRUAL_TYPES = [
  { id: 'percent', name: 'Foiz' },
  { id: 'fix_summa', name: 'Belgilangan summa' },
]

// UZS -> "so'm", qolganlari qisqa nomi bilan (USD, RUB ...).
function currencyLabel(shortName) {
  return shortName?.toUpperCase() === 'UZS' ? 'so‘m' : shortName ?? ''
}

export function mapAccrualRetention(raw) {
  const value = raw.value != null ? String(Number(raw.value)) : ''
  const currencyShort = raw.currency_info?.short_name ?? ''
  let qiymat = ''
  if (value !== '') {
    qiymat =
      raw.type === 'percent'
        ? `${formatNumber(value, Number.isInteger(Number(value)) ? 0 : 2)}%`
        : `${formatNumber(value, Number.isInteger(Number(value)) ? 0 : 2)} ${currencyLabel(currencyShort)}`.trim()
  }
  return {
    id: raw.id,
    name: raw.name ?? '',
    type: raw.type ?? '',
    tur: ACCRUAL_TYPES.find((t) => t.id === raw.type)?.name ?? '',
    valyutaId: raw.currency_info?.id ?? '',
    valyuta: currencyShort || raw.currency_info?.name || '',
    value,
    qiymat,
    ...mapMeta(raw),
  }
}

export function buildAccrualRetentionPayload(draft) {
  return {
    name: draft.name.trim(),
    type: draft.type,
    currency: draft.valyutaId,
    value: draft.value || '0',
  }
}

// ── Kontragentlar ──
export function mapCounterparty(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    phone: raw.phone_number ? formatUzPhone(raw.phone_number) : '',
    turId: raw.type_info?.id ?? '',
    tur: raw.type_info?.name ?? '',
    ...mapMeta(raw),
  }
}

export function buildCounterpartyPayload(draft) {
  return {
    name: draft.name.trim(),
    phone_number: draft.phone ? draft.phone.replace(/[\s-]/g, '') : '',
    type: draft.turId,
  }
}
