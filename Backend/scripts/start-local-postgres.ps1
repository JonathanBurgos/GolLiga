$ErrorActionPreference = 'Stop'
$pgBin = 'C:\Program Files\PostgreSQL\18\bin'
$dataDir = Join-Path $PSScriptRoot '..\.local-postgres-data'
$dataDir = [System.IO.Path]::GetFullPath($dataDir)
$pgCtl = Join-Path $pgBin 'pg_ctl.exe'
$pgIsReady = Join-Path $pgBin 'pg_isready.exe'
$initDb = Join-Path $pgBin 'initdb.exe'
$psql = Join-Path $pgBin 'psql.exe'
$createdb = Join-Path $pgBin 'createdb.exe'

if (-not (Test-Path (Join-Path $dataDir 'PG_VERSION'))) {
  & $initDb -D $dataDir -U postgres -A trust --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo inicializar el clúster PostgreSQL local.' }
}

& $pgIsReady -h 127.0.0.1 -p 5434 *> $null
if ($LASTEXITCODE -ne 0) {
  & $pgCtl -D $dataDir -l (Join-Path $PSScriptRoot '..\local-postgres.log') -o '-p 5434 -h 127.0.0.1' start
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar PostgreSQL local en el puerto 5434.' }
}

$roleExists = & $psql -h 127.0.0.1 -p 5434 -U postgres -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='golliga'"
if (-not $roleExists) {
  & $psql -h 127.0.0.1 -p 5434 -U postgres -d postgres -c "CREATE ROLE golliga WITH LOGIN PASSWORD 'golliga_dev' CREATEDB"
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el usuario PostgreSQL de desarrollo.' }
}

$databaseExists = & $psql -h 127.0.0.1 -p 5434 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='golliga'"
if (-not $databaseExists) {
  & $createdb -h 127.0.0.1 -p 5434 -U postgres -O golliga golliga
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la base golliga.' }
}

Write-Host 'PostgreSQL local disponible en 127.0.0.1:5434; base de datos: golliga.'
