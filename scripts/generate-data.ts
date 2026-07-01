import fs from 'node:fs'
import path from 'node:path'
import { EXAMPLES } from '../src/examples/index.ts'
import { generateCompanies } from '../src/lib/generate/companies.ts'
import { generateIndividuals } from '../src/lib/generate/individuals.ts'
import { generateEvents } from '../src/lib/generate/events.ts'
import { messifyIndividual, messifyCompany } from '../src/lib/generate/messify.ts'
import { rng } from '../src/lib/generate/seed.ts'

const DATA_DIR = path.join(process.cwd(), 'src/data')

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data))
}

let totalInd = 0
let totalCo = 0
for (const cfg of EXAMPLES) {
  const companies = cfg.coverage.entities.includes('companies') ? generateCompanies(cfg) : []
  const individuals = cfg.coverage.entities.includes('individuals') ? generateIndividuals(cfg, companies) : []
  const events = cfg.coverage.entities.includes('events') ? generateEvents(cfg) : []

  const rIndividuals = rng(cfg.seed + 11)
  const rCompanies = rng(cfg.seed + 12)
  const dir = path.join(DATA_DIR, cfg.id)
  writeJson(path.join(dir, 'individuals.json'), individuals.map((t) => ({ truth: t, display: messifyIndividual(t, cfg, rIndividuals) })))
  writeJson(path.join(dir, 'companies.json'), companies.map((t) => ({ truth: t, display: messifyCompany(t, cfg, rCompanies) })))
  writeJson(path.join(dir, 'events.json'), events)
  writeJson(path.join(dir, 'meta.json'), { config: cfg, counts: { individuals: individuals.length, companies: companies.length, events: events.length } })

  totalInd += individuals.length
  totalCo += companies.length
  process.stdout.write(`\r  ${cfg.order}/21 ${cfg.eventName} (${individuals.length} ind, ${companies.length} co)        `)
}
console.log(`\nDone. ${totalInd} individuals, ${totalCo} companies across 21 examples.`)
if (totalInd < 1000) throw new Error(`Only ${totalInd} individuals — spec requires >=1000`)
if (totalCo < 600) throw new Error(`Only ${totalCo} companies — spec requires >=600`)
