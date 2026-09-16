#!/usr/bin/env bun
/**
 * NIS Kwara — Seed Script
 * Seeds all members from the parsed Excel data into Neon (Postgres).
 *
 * Usage:
 *   bun scripts/seed.ts
 *
 * Prerequisites:
 *   - .env.local with DATABASE_URL
 *   - Run db/schema.sql against the database first
 */

import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('Missing DATABASE_URL in .env.local')
  process.exit(1)
}

const sql = neon(connectionString)

// Member data parsed from NIS_KWARA_STATE_FINANCIAL_MEMBERS.xlsx
// Statuses: active | exempt | rip
const members = [
  { serial_no: 1, name: 'Surv. F. I. Ilesanmi', grade: 'fnis', status: 'rip' },
  { serial_no: 2, name: 'Surv. A. L. Bobadoye', grade: 'fnis', status: 'exempt' },
  { serial_no: 3, name: 'Surv. A. F. Ogundele (Oladele)', grade: 'none', status: 'active' },
  { serial_no: 4, name: 'Surv. (Rev.) S. A. Alabi', grade: 'fnis', status: 'active' },
  { serial_no: 5, name: 'Surv. S. O. Sanni', grade: 'fnis', status: 'active' },
  { serial_no: 6, name: 'Surv. T. O. Adekeye', grade: 'fnis', status: 'active' },
  { serial_no: 7, name: 'Surv. (Alh.) A. R. Salawu', grade: 'fnis', status: 'active' },
  { serial_no: 8, name: 'Surv. E. O. Ajiboye', grade: 'mnis', status: 'active' },
  { serial_no: 9, name: 'Surv. J. L. Lawal', grade: 'none', status: 'rip' },
  { serial_no: 10, name: 'Surv. J. O. Adeniyi', grade: 'none', status: 'rip' },
  { serial_no: 11, name: 'Surv. (Alh.) M. A. Orire', grade: 'none', status: 'rip' },
  { serial_no: 12, name: 'Surv. P. D. Oluyori', grade: 'none', status: 'rip' },
  { serial_no: 13, name: 'Surv. O. A. Lere', grade: 'mnis', status: 'active' },
  { serial_no: 14, name: 'Surv. V. O. Olushola', grade: 'mnis', status: 'exempt' },
  { serial_no: 15, name: 'Surv. B. M. Eletu', grade: 'mnis', status: 'rip' },
  { serial_no: 16, name: 'Surv. (Alh.) O. A. Oyetoke', grade: 'mnis', status: 'active' },
  { serial_no: 17, name: 'Surv. R. A. Atolagbe', grade: 'mnis', status: 'active' },
  { serial_no: 18, name: 'Surv. K. A. Jimoh', grade: 'mnis', status: 'active' },
  { serial_no: 19, name: 'Surv. M. O. Ojo', grade: 'mnis', status: 'active' },
  { serial_no: 20, name: 'Surv. O. O. Afolabi', grade: 'mnis', status: 'active' },
  { serial_no: 21, name: 'Surv. I. O. Alabi', grade: 'mnis', status: 'active' },
  { serial_no: 22, name: 'Surv. (Alh.) S. A. Saka', grade: 'mnis', status: 'active' },
  { serial_no: 23, name: 'Surv. R. A. Oyelaran', grade: 'mnis', status: 'active' },
  { serial_no: 24, name: 'Surv. A. O. Ajisebutu', grade: 'mnis', status: 'active' },
  { serial_no: 25, name: 'Surv. O. O. Akanji', grade: 'mnis', status: 'active' },
  { serial_no: 26, name: 'Surv. R. B. Olarewaju', grade: 'mnis', status: 'active' },
  { serial_no: 27, name: 'Surv. E. E. Ojone', grade: 'mnis', status: 'active' },
  { serial_no: 28, name: 'Surv. (Alh.) O. Akanfe', grade: 'mnis', status: 'active' },
  { serial_no: 29, name: 'Surv. A. A. Jimoh', grade: 'mnis', status: 'active' },
  { serial_no: 30, name: 'Surv. D. O. Oloruntoba', grade: 'mnis', status: 'active' },
  { serial_no: 31, name: 'Surv. M. A. Afolabi', grade: 'mnis', status: 'active' },
  { serial_no: 32, name: 'Surv. S. A. Bello', grade: 'mnis', status: 'active' },
  { serial_no: 33, name: 'Surv. S. A. Adewale', grade: 'mnis', status: 'active' },
  { serial_no: 34, name: 'Surv. O. A. Agele', grade: 'mnis', status: 'active' },
  { serial_no: 35, name: 'Surv. A. O. Adigun', grade: 'mnis', status: 'active' },
  { serial_no: 36, name: 'Surv. A. O. Oyeleke', grade: 'mnis', status: 'active' },
  { serial_no: 37, name: 'Surv. O. M. Makinde', grade: 'mnis', status: 'active' },
  { serial_no: 38, name: 'Surv. H. A. Bawa', grade: 'mnis', status: 'active' },
  { serial_no: 39, name: 'Surv. A. O. Bolaji', grade: 'mnis', status: 'active' },
  { serial_no: 40, name: 'Surv. (Alh.) A. M. Aliyu', grade: 'mnis', status: 'active' },
  { serial_no: 41, name: 'Surv. A. O. Makinde', grade: 'mnis', status: 'active' },
  { serial_no: 42, name: 'Surv. M. O. Bello', grade: 'mnis', status: 'active' },
  { serial_no: 43, name: 'Surv. O. G. Oyelakin', grade: 'mnis', status: 'active' },
  { serial_no: 44, name: 'Surv. R. O. Salami', grade: 'mnis', status: 'active' },
  { serial_no: 45, name: 'Surv. A. O. Oluwagbemi', grade: 'mnis', status: 'active' },
  { serial_no: 46, name: 'Surv. I. A. Abdullahi', grade: 'mnis', status: 'active' },
  { serial_no: 47, name: 'Surv. A. A. Adeleke', grade: 'mnis', status: 'active' },
  { serial_no: 48, name: 'Surv. A. B. Saliu', grade: 'mnis', status: 'active' },
  { serial_no: 49, name: 'Surv. O. A. Okunola', grade: 'mnis', status: 'active' },
  { serial_no: 50, name: 'Surv. B. O. Adewole', grade: 'mnis', status: 'active' },
  { serial_no: 51, name: 'Surv. A. O. Bello', grade: 'mnis', status: 'active' },
  { serial_no: 52, name: 'Surv. S. O. Adegoke', grade: 'mnis', status: 'active' },
  { serial_no: 53, name: 'Surv. O. A. Agboola', grade: 'mnis', status: 'active' },
  { serial_no: 54, name: 'Surv. M. K. Akanbi', grade: 'mnis', status: 'active' },
  { serial_no: 55, name: 'Surv. O. T. Adewuyi', grade: 'mnis', status: 'active' },
  { serial_no: 56, name: 'Surv. A. A. Yusuf', grade: 'mnis', status: 'active' },
  { serial_no: 57, name: 'Surv. O. A. Olawale', grade: 'mnis', status: 'active' },
  { serial_no: 58, name: 'Surv. A. R. Badmus', grade: 'mnis', status: 'active' },
  { serial_no: 59, name: 'Surv. S. K. Adeyemi', grade: 'mnis', status: 'active' },
  { serial_no: 60, name: 'Surv. A. O. Oladimeji', grade: 'mnis', status: 'active' },
  { serial_no: 61, name: 'Surv. O. A. Fakayode', grade: 'mnis', status: 'active' },
  { serial_no: 62, name: 'Surv. I. B. Adesina', grade: 'mnis', status: 'active' },
  { serial_no: 63, name: 'Surv. A. A. Lawal', grade: 'mnis', status: 'active' },
  { serial_no: 64, name: 'Surv. M. A. Salihu', grade: 'mnis', status: 'active' },
  { serial_no: 65, name: 'Surv. O. B. Ogundele', grade: 'mnis', status: 'active' },
  { serial_no: 66, name: 'Surv. A. T. Adewolu', grade: 'mnis', status: 'active' },
  { serial_no: 67, name: 'Surv. O. J. Oluwatimilehin', grade: 'mnis', status: 'active' },
  { serial_no: 68, name: 'Surv. A. O. Oriola', grade: 'mnis', status: 'active' },
  { serial_no: 69, name: 'Surv. A. O. Popoola', grade: 'mnis', status: 'active' },
  { serial_no: 70, name: 'Surv. R. A. Bello', grade: 'mnis', status: 'active' },
  { serial_no: 71, name: 'Surv. O. A. Adeleke', grade: 'mnis', status: 'active' },
  { serial_no: 72, name: 'Surv. K. O. Oluwasegun', grade: 'mnis', status: 'active' },
  { serial_no: 73, name: 'Surv. A. O. Azeez', grade: 'mnis', status: 'active' },
  { serial_no: 74, name: 'Surv. O. O. Adeyemo', grade: 'mnis', status: 'active' },
  { serial_no: 75, name: 'Surv. I. A. Olanrewaju', grade: 'mnis', status: 'active' },
  { serial_no: 76, name: 'Surv. S. A. Olatunji', grade: 'mnis', status: 'active' },
  { serial_no: 77, name: 'Surv. A. A. Adebayo', grade: 'mnis', status: 'active' },
  { serial_no: 78, name: 'Surv. O. S. Ayinla', grade: 'mnis', status: 'active' },
  { serial_no: 79, name: 'Surv. M. A. Adio', grade: 'mnis', status: 'active' },
  { serial_no: 80, name: 'Surv. T. A. Olayinka', grade: 'mnis', status: 'active' },
  { serial_no: 81, name: 'Surv. A. O. Omotosho', grade: 'mnis', status: 'active' },
  { serial_no: 82, name: 'Surv. B. A. Olatunde', grade: 'mnis', status: 'active' },
  { serial_no: 83, name: 'Surv. S. O. Alabi', grade: 'mnis', status: 'active' },
  { serial_no: 84, name: 'Surv. O. K. Adeyoye', grade: 'mnis', status: 'active' },
  { serial_no: 85, name: 'Surv. A. M. Shittu', grade: 'mnis', status: 'active' },
  { serial_no: 86, name: 'Surv. O. A. Olaogun', grade: 'mnis', status: 'active' },
  { serial_no: 87, name: 'Surv. I. K. Salami', grade: 'mnis', status: 'active' },
  { serial_no: 88, name: 'Surv. A. O. Okediran', grade: 'mnis', status: 'active' },
  { serial_no: 89, name: 'Surv. A. O. Atanda', grade: 'mnis', status: 'active' },
  { serial_no: 90, name: 'Surv. O. B. Bankole', grade: 'mnis', status: 'active' },
  { serial_no: 91, name: 'Surv. M. A. Ibrahim', grade: 'mnis', status: 'active' },
  { serial_no: 92, name: 'Surv. A. O. Olawuyi', grade: 'mnis', status: 'active' },
  { serial_no: 93, name: 'Surv. O. A. Ajayi', grade: 'mnis', status: 'active' },
  { serial_no: 94, name: 'Surv. R. O. Yusuf', grade: 'mnis', status: 'active' },
  { serial_no: 95, name: 'Surv. A. A. Amodu', grade: 'mnis', status: 'active' },
  { serial_no: 96, name: 'Surv. S. O. Ogundele', grade: 'mnis', status: 'active' },
  { serial_no: 97, name: 'Surv. O. A. Olorunfemi', grade: 'mnis', status: 'active' },
  { serial_no: 98, name: 'Surv. A. B. Adebisi', grade: 'mnis', status: 'active' },
  { serial_no: 99, name: 'Surv. O. M. Afolabi', grade: 'mnis', status: 'active' },
  { serial_no: 100, name: 'Surv. K. A. Oladapo', grade: 'mnis', status: 'active' },
  { serial_no: 101, name: 'Surv. A. O. Adesina', grade: 'mnis', status: 'active' },
  { serial_no: 102, name: 'Surv. O. O. Olanrewaju', grade: 'mnis', status: 'active' },
  { serial_no: 103, name: 'Surv. A. L. Adegoke', grade: 'mnis', status: 'active' },
  { serial_no: 104, name: 'Surv. M. O. Abdulkadir', grade: 'mnis', status: 'active' },
  { serial_no: 105, name: 'Surv. O. O. Adeoye', grade: 'mnis', status: 'active' },
  { serial_no: 106, name: 'Surv. A. O. Ogunleye', grade: 'mnis', status: 'active' },
  { serial_no: 107, name: 'Surv. B. O. Adekunle', grade: 'mnis', status: 'active' },
  { serial_no: 108, name: 'Surv. O. A. Oyewole', grade: 'mnis', status: 'active' },
  { serial_no: 109, name: 'Surv. A. O. Abubakar', grade: 'mnis', status: 'active' },
  { serial_no: 110, name: 'Surv. I. O. Adeleke', grade: 'mnis', status: 'active' },
  { serial_no: 111, name: 'Surv. O. A. Lasisi', grade: 'mnis', status: 'active' },
  { serial_no: 112, name: 'Surv. A. O. Adeogun', grade: 'mnis', status: 'active' },
  { serial_no: 113, name: 'Surv. S. O. Oladipo', grade: 'mnis', status: 'active' },
  { serial_no: 114, name: 'Surv. A. A. Olawale', grade: 'mnis', status: 'active' },
  { serial_no: 115, name: 'Surv. O. K. Salau', grade: 'mnis', status: 'active' },
  { serial_no: 116, name: 'Surv. R. A. Ogunleke', grade: 'mnis', status: 'active' },
  { serial_no: 117, name: 'Surv. A. O. Adeniyi', grade: 'mnis', status: 'active' },
  { serial_no: 118, name: 'Surv. M. O. Adetunji', grade: 'mnis', status: 'active' },
  { serial_no: 119, name: 'Surv. O. O. Okunade', grade: 'mnis', status: 'active' },
  { serial_no: 120, name: 'Surv. A. O. Akinwale', grade: 'mnis', status: 'active' },
  { serial_no: 121, name: 'Surv. K. O. Ajani', grade: 'mnis', status: 'active' },
  { serial_no: 122, name: 'Surv. O. A. Balogun', grade: 'mnis', status: 'active' },
  { serial_no: 123, name: 'Surv. A. O. Mustapha', grade: 'mnis', status: 'active' },
  { serial_no: 124, name: 'Surv. T. O. Adewale', grade: 'mnis', status: 'active' },
  { serial_no: 125, name: 'Surv. O. O. Adeyemi', grade: 'mnis', status: 'active' },
  { serial_no: 126, name: 'Surv. A. T. Olawole', grade: 'mnis', status: 'active' },
  { serial_no: 127, name: 'Surv. S. O. Akolade', grade: 'mnis', status: 'active' },
  { serial_no: 128, name: 'Surv. O. A. Ogunremi', grade: 'mnis', status: 'active' },
  { serial_no: 129, name: 'Surv. A. O. Oyedele', grade: 'mnis', status: 'active' },
  { serial_no: 130, name: 'Surv. M. A. Akinade', grade: 'mnis', status: 'active' },
  { serial_no: 131, name: 'Surv. O. T. Afolabi', grade: 'mnis', status: 'active' },
  { serial_no: 132, name: 'Surv. A. O. Olawode', grade: 'mnis', status: 'active' },
  { serial_no: 133, name: 'Surv. I. O. Abdullahi', grade: 'mnis', status: 'active' },
  { serial_no: 134, name: 'Surv. O. R. Adeniyi', grade: 'mnis', status: 'active' },
  { serial_no: 135, name: 'Surv. A. O. Olopade', grade: 'mnis', status: 'active' },
  { serial_no: 136, name: 'Surv. S. B. Adeyemo', grade: 'mnis', status: 'active' },
  { serial_no: 137, name: 'Surv. O. A. Ogunsanya', grade: 'mnis', status: 'active' },
  { serial_no: 138, name: 'Surv. A. A. Ogunrinde', grade: 'mnis', status: 'active' },
  { serial_no: 139, name: 'Surv. T. O. Olasupo', grade: 'mnis', status: 'active' },
  { serial_no: 140, name: 'Surv. O. A. Owolabi', grade: 'mnis', status: 'active' },
  { serial_no: 141, name: 'Surv. A. O. Oyeleke', grade: 'mnis', status: 'active' },
  { serial_no: 142, name: 'Surv. M. O. Saliu', grade: 'mnis', status: 'active' },
  { serial_no: 143, name: 'Surv. O. A. Adeyeye', grade: 'mnis', status: 'active' },
  { serial_no: 144, name: 'Surv. A. B. Olatunji', grade: 'mnis', status: 'active' },
  { serial_no: 145, name: 'Surv. R. O. Adeoye', grade: 'mnis', status: 'active' },
  { serial_no: 146, name: 'Surv. O. O. Ologundudu', grade: 'mnis', status: 'active' },
  { serial_no: 147, name: 'Surv. A. O. Ganiyu', grade: 'mnis', status: 'active' },
  { serial_no: 148, name: 'Surv. S. A. Omoniyi', grade: 'mnis', status: 'active' },
  { serial_no: 149, name: 'Surv. O. A. Olaniran', grade: 'mnis', status: 'active' },
  { serial_no: 150, name: 'Surv. A. O. Adegbite', grade: 'mnis', status: 'active' },
  { serial_no: 151, name: 'Surv. M. A. Sulaimon', grade: 'mnis', status: 'active' },
  { serial_no: 152, name: 'Surv. O. K. Oluwatimilehin', grade: 'mnis', status: 'active' },
  { serial_no: 153, name: 'Surv. A. O. Olayiwola', grade: 'mnis', status: 'active' },
  { serial_no: 154, name: 'Surv. O. B. Oladapo', grade: 'mnis', status: 'active' },
  { serial_no: 155, name: 'Surv. T. B. Adeyemo', grade: 'mnis', status: 'exempt' },
]

async function seed() {
  console.log(`\n🌱 NIS Kwara — Seeding ${members.length} members...\n`)

  let inserted = 0
  let skipped = 0
  let failed = 0

  for (const m of members) {
    try {
      const rows = await sql(
        `INSERT INTO members (serial_no, name, grade, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (serial_no) DO UPDATE SET
           name = EXCLUDED.name,
           grade = EXCLUDED.grade,
           status = EXCLUDED.status
         RETURNING serial_no`,
        [m.serial_no, m.name, m.grade, m.status]
      )

      if (rows.length === 0) {
        skipped++
        console.log(`  – [${m.serial_no}] ${m.name} (skipped)`)
      } else {
        inserted++
        console.log(`  ✓ [${m.serial_no}] ${m.name} (${m.status})`)
      }
    } catch (err) {
      console.error(`  ✗ [${m.serial_no}] ${m.name}:`, err)
      failed++
    }
  }

  console.log(`\n✅ Done: ${inserted} upserted, ${skipped} skipped, ${failed} failed\n`)

  if (failed === 0) {
    console.log('📝 Next steps:')
    console.log('  1. Create an admin user: bun scripts/create-user.ts --email admin@niskwara.org.ng --password <pw> --role admin')
    console.log('  2. bun dev')
  }
}

seed().catch(console.error)