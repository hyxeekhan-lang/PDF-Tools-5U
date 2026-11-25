import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const migrationVersion = '001_initial_neon_schema'

if (process.env.VERCEL_ENV !== 'production') {
  console.info('Skipping Neon schema migration outside Vercel Production.')
} else {
  const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('Production Neon migration requires DATABASE_URL_UNPOOLED or DATABASE_URL.')
  }

  const sql = neon(connectionString)

  try {
    const [capabilities] = await sql.query(`
      select
        to_regprocedure('auth.user_id()') is not null as has_user_id,
        exists (select 1 from pg_roles where rolname = 'authenticated') as has_authenticated_role
    `)

    const missingPrerequisites = []
    if (!capabilities?.has_user_id) missingPrerequisites.push('auth.user_id()')
    if (!capabilities?.has_authenticated_role) missingPrerequisites.push('authenticated role')

    if (missingPrerequisites.length > 0) {
      throw new Error(`Missing Neon prerequisite(s): ${missingPrerequisites.join(', ')}.`)
    }

    await sql.query('create schema if not exists pdfpilot_migrations')
    await sql.query(`
      create table if not exists pdfpilot_migrations.schema_migrations (
        version text primary key,
        applied_at timestamptz not null default now()
      )
    `)

    const [applied] = await sql.query(
      'select version from pdfpilot_migrations.schema_migrations where version = $1',
      [migrationVersion],
    )

    if (applied) {
      console.info(`Neon schema migration ${migrationVersion} is already applied.`)
    } else {
      const schema = await readFile(new URL('../neon/schema.sql', import.meta.url), 'utf8')
      const statements = schema.split(';').map((statement) => statement.trim()).filter(Boolean)

      if (statements.length === 0) {
        throw new Error('neon/schema.sql contains no SQL statements.')
      }

      for (const statement of statements) {
        await sql.query(statement)
      }

      await sql.query(
        'insert into pdfpilot_migrations.schema_migrations (version) values ($1)',
        [migrationVersion],
      )
      console.info(`Applied Neon schema migration ${migrationVersion}.`)
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    const safeDetail = detail.replaceAll(connectionString, '[redacted database URL]')
    console.error(`Neon schema migration failed: ${safeDetail}`)
    console.error('Enable Neon Auth and the Data API, verify its authenticated role, and retry the deployment.')
    process.exitCode = 1
  }
}
