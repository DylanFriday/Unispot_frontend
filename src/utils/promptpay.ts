type PromptPayInput = {
  phoneOrId: string
  amountBaht: number
}

const formatTag = (id: string, value: string) => {
  const length = value.length.toString().padStart(2, '0')
  return `${id}${length}${value}`
}

const normalizePhoneOrId = (value: string) => {
  const raw = value.replace(/\s+/g, '')
  const e164 = raw.startsWith('0') ? `66${raw.slice(1)}` : raw
  return `00${e164}`
}

const crc16Ccitt = (payload: string) => {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
      crc &= 0xffff 
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export const buildPromptPayPayload = ({ phoneOrId, amountBaht }: PromptPayInput) => {
  const normalized = normalizePhoneOrId(phoneOrId)
  const amount = amountBaht.toFixed(2)

  const applicationId = formatTag('00', 'A000000677010111')
  const accountId = formatTag('01', normalized)
  const merchantAccountInfo = formatTag('29', `${applicationId}${accountId}`)

  const payloadFormat = formatTag('00', '01')
  const pointOfInitiation = formatTag('01', '12')
  const merchantCategory = formatTag('52', '0000')
  const transactionCurrency = formatTag('53', '764')
  const transactionAmount = formatTag('54', amount)
  const countryCode = formatTag('58', 'TH')
  const merchantName = formatTag('59', 'PromptPay')
  const merchantCity = formatTag('60', 'Bangkok')

  const payloadWithoutCrc =
    payloadFormat +
    pointOfInitiation +
    merchantAccountInfo +
    merchantCategory +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    '6304'

  const crc = crc16Ccitt(payloadWithoutCrc)
  return `${payloadWithoutCrc}${crc}`
}
