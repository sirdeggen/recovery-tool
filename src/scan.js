// Same candidate set as scan-seed.mjs. Returns labels only, never keys.
import { Mnemonic, HD, KeyDeriver, Utils } from '@bsv/sdk'

const SUFFIX = Utils.toBase64(Utils.toArray('legacy', 'utf8'))
const PROTO = [2, '3241645161d8']

function* candidates(hd) {
  const addr = k => k.toPublicKey().toAddress('mainnet')
  yield ['BIP32 master key (P2PKH)', () => addr(hd.privKey)]
  for (let n = 0; n < 10; n++) {
    yield [`primary m/0'/${n}' (P2PKH of identity key)`, () => addr(hd.derive(`m/0'/${n}'`).privKey)]
    yield [`privileged m/1'/${n}' (P2PKH)`, () => addr(hd.derive(`m/1'/${n}'`).privKey)]
  }
  for (const base of ["m/44'/236'/0'", "m/44'/0'/0'", "m/44'/145'/0'", 'm/0', "m/0'"]) {
    for (const ch of [0, 1]) for (let i = 0; i < 20; i++) yield [`${base}/${ch}/${i}`, () => addr(hd.derive(`${base}/${ch}/${i}`).privKey)]
  }
  const dates = []
  for (let t = Date.UTC(2026, 6, 1); t <= Date.UTC(2026, 9, 31); t += 86400000) dates.push(new Date(t).toISOString().slice(0, 10))
  const roots = [['master', hd.privKey]]
  for (let n = 0; n < 10; n++) roots.push([`m/0'/${n}'`, hd.derive(`m/0'/${n}'`).privKey], [`m/1'/${n}'`, hd.derive(`m/1'/${n}'`).privKey])
  for (const [rootLabel, key] of roots) {
    const kd = new KeyDeriver(key)
    for (const d of dates) {
      const keyID = `${Utils.toBase64(Utils.toArray(d, 'utf8'))} ${SUFFIX}`
      for (const cp of ['anyone', 'self']) {
        for (const forSelf of [true, false]) {
          yield [`legacy rail root=${rootLabel} date=${d} counterparty=${cp} forSelf=${forSelf}`,
            () => kd.derivePublicKey(PROTO, keyID, cp, forSelf).toAddress('mainnet')]
        }
      }
    }
  }
}

export const TOTAL = 10553

export function validSeed(seed) {
  try { Mnemonic.fromString(seed); return true } catch { return false }
}

export async function scan(seed, target, onProgress) {
  const hd = HD.fromSeed(Mnemonic.fromString(seed).toSeed(''))
  let checked = 0
  const hits = []
  for (const [label, derive] of candidates(hd)) {
    if (derive() === target) hits.push(label)
    if (++checked % 200 === 0) {
      onProgress(checked)
      await new Promise(r => setTimeout(r, 0))
    }
  }
  onProgress(checked)
  return { checked, hits }
}
