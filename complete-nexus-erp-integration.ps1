Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " NEXUS -> VISA MATRIX ERP INTEGRATION" -ForegroundColor Cyan
Write-Host " Master implementation runner" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$nexus = Join-Path $root "NEXUS\Platform"
$erp = Join-Path $root "visa-matrix-backend\backend"

if (!(Test-Path $nexus)) {
    throw "NEXUS platform not found: $nexus"
}

if (!(Test-Path $erp)) {
    throw "Visa Matrix ERP backend not found: $erp"
}

Write-Host "[1/6] Verifying project structure..." -ForegroundColor Yellow

$required = @(
    "$nexus\src\connectors\visa-matrix-backend.ts",
    "$nexus\src\orchestration\pipeline.ts",
    "$nexus\src\orchestration\types.ts",
    "$erp\src\modules\integrations\nexus.routes.js",
    "$erp\src\modules\integrations\nexus.controller.js",
    "$erp\src\modules\customers\customer.service.js",
    "$erp\src\modules\customers\customer.controller.js"
)

foreach ($file in $required) {
    if (!(Test-Path $file)) {
        throw "Required file missing: $file"
    }
}

Write-Host "[2/6] Verifying package managers..." -ForegroundColor Yellow

if (!(Test-Path "$nexus\package.json")) {
    throw "NEXUS package.json not found."
}

if (!(Test-Path "$erp\package.json")) {
    throw "ERP package.json not found."
}

$nexusPackage = Get-Content "$nexus\package.json" -Raw | ConvertFrom-Json

if ($nexusPackage.packageManager -and $nexusPackage.packageManager -notmatch "^pnpm@") {
    Write-Warning "NEXUS packageManager is $($nexusPackage.packageManager)."
}

Write-Host "[3/6] Creating integration workspace..." -ForegroundColor Yellow

$work = Join-Path $root ".nexus-integration-work"
if (!(Test-Path $work)) {
    New-Item -ItemType Directory -Path $work | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $work "backup-$timestamp"

New-Item -ItemType Directory -Path $backup | Out-Null

Write-Host "Backup directory: $backup" -ForegroundColor DarkGray

Write-Host "[4/6] Creating integration audit snapshot..." -ForegroundColor Yellow

@"
NEXUS -> Visa Matrix ERP Integration Snapshot
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Canonical NEXUS:
$nexus

Canonical ERP:
$erp

Current integration:
customer.get

Required integration groups:
Customers
Leads
Applications
Documents
Visa Catalog / Rules
Forms
Invoices
Payments
Tasks
Workflows

Next implementation stage:
ERP capability layer + NEXUS tool registration + end-to-end tests
"@ | Set-Content (Join-Path $work "INTEGRATION_STATUS.txt")

Write-Host "[5/6] Running existing NEXUS integration tests..." -ForegroundColor Yellow

Push-Location $nexus
try {
    & pnpm test -- --run tests/integration-execution.test.ts tests/api-execution.test.ts tests/visa-matrix-backend.test.ts

    if ($LASTEXITCODE -ne 0) {
        throw "Existing NEXUS integration tests failed. No integration changes will be made."
    }
}
finally {
    Pop-Location
}

Write-Host "[6/6] Integration gate passed." -ForegroundColor Green
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host " SAFE CHECKPOINT COMPLETE" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "No ERP/NEXUS source files were modified." -ForegroundColor Green
Write-Host "Existing integration tests passed." -ForegroundColor Green
Write-Host ""
Write-Host "The project is ready for the actual capability-layer implementation." -ForegroundColor Cyan
Write-Host ""
Write-Host "Snapshot:" -ForegroundColor Yellow
Write-Host "  $work\INTEGRATION_STATUS.txt"
