$ErrorActionPreference = "Stop"

$Root = "C:\Users\Admin\Visa Matrix ERP"
$Nexus = Join-Path $Root "NEXUS\Platform"
$Backend = Join-Path $Root "visa-matrix-backend\backend"

$Capabilities = @(
    "01 Customers",
    "02 Applications",
    "03 Documents",
    "04 Leads",
    "05 Visa-Rules-Requirements",
    "06 Forms",
    "07 Invoices",
    "08 Payments",
    "09 Tasks",
    "10 Workflows",
    "11 NEXUS-Tool-Registration",
    "12 Agent-Planner",
    "13 Write-Actions-Confirmations",
    "14 NEXUS-API",
    "15 ERP-NEXUS-UI",
    "16 Full-End-To-End-Test"
)

$Work = Join-Path $Root ".nexus-integration-work\MASTER"
New-Item -ItemType Directory -Force $Work | Out-Null

$Status = Join-Path $Work "MASTER_INTEGRATION_STATUS.txt"

function Write-Status($text) {
    Add-Content -Path $Status -Value $text
    Write-Host $text
}

Set-Content $Status @"
============================================================
 VISA MATRIX ERP <-> NEXUS MASTER INTEGRATION
============================================================
Started: $(Get-Date)
============================================================

ROADMAP
"@

foreach ($Capability in $Capabilities) {
    Add-Content $Status $Capability
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " VISA MATRIX ERP <-> NEXUS MASTER INTEGRATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# VERIFY PROJECTS
# ------------------------------------------------------------

if (-not (Test-Path $Nexus)) {
    throw "NEXUS project not found."
}

if (-not (Test-Path $Backend)) {
    throw "ERP backend not found."
}

Write-Status "`n[CHECK] Project structure OK."

# ------------------------------------------------------------
# VERIFY EXISTING COMPLETED WORK
# ------------------------------------------------------------

$Connector = Join-Path $Nexus "src\connectors\visa-matrix-backend.ts"
$NexusController = Join-Path $Backend "src\modules\integrations\nexus.controller.js"
$NexusRoutes = Join-Path $Backend "src\modules\integrations\nexus.routes.js"

foreach ($File in @($Connector,$NexusController,$NexusRoutes)) {
    if (-not (Test-Path $File)) {
        throw "Required integration file missing: $File"
    }
}

Write-Status "[CHECK] Integration boundary files OK."

# ------------------------------------------------------------
# CAPABILITY DETECTION
# ------------------------------------------------------------

$ConnectorText = Get-Content $Connector -Raw
$ControllerText = Get-Content $NexusController -Raw
$RouteText = Get-Content $NexusRoutes -Raw

$Checks = [ordered]@{
    "customer.get" = $ConnectorText.Contains("customer.get")
    "customer.list" = $ConnectorText.Contains("customer.list")
    "application.get" = $ConnectorText.Contains("application.get")
    "ERP application.get route" = $RouteText.Contains("/application.get")
    "ERP customer.get route" = $RouteText.Contains("/customer.get")
    "ERP customer.list route" = $RouteText.Contains("/customer.list")
}

Write-Status "`nCURRENT CAPABILITY STATUS"

foreach ($Item in $Checks.GetEnumerator()) {
    if ($Item.Value) {
        Write-Status "[CONNECTED] $($Item.Key)"
    } else {
        Write-Status "[PENDING]   $($Item.Key)"
    }
}

# ------------------------------------------------------------
# RUN EXISTING INTEGRATION GATE
# ------------------------------------------------------------

Write-Host ""
Write-Host "Running NEXUS integration tests..." -ForegroundColor Yellow

Push-Location $Nexus

try {
    & pnpm test -- --run `
        tests/visa-matrix-backend.test.ts `
        tests/integration-execution.test.ts `
        tests/api-execution.test.ts

    if ($LASTEXITCODE -ne 0) {
        throw "NEXUS integration tests failed."
    }
}
finally {
    Pop-Location
}

Write-Status "`n[PASS] Existing integration gate passed."

# ------------------------------------------------------------
# DISCOVER REMAINING ERP CAPABILITIES
# ------------------------------------------------------------

Write-Host ""
Write-Host "Discovering existing ERP modules..." -ForegroundColor Yellow

$ModuleRoot = Join-Path $Backend "src\modules"

$Modules = Get-ChildItem $ModuleRoot -Directory |
    Select-Object -ExpandProperty Name |
    Sort-Object

Write-Status "`nERP MODULES DISCOVERED"

foreach ($Module in $Modules) {
    Write-Status "  - $Module"
}

# ------------------------------------------------------------
# FINAL MASTER STATUS
# ------------------------------------------------------------

Write-Status @"

============================================================
MASTER CHECKPOINT
============================================================

COMPLETED:
  Customers
  Applications (application.get)

NEXT EXECUTION TARGET:
  application.list
  Documents
  Leads
  Visa / Rules / Requirements
  Forms
  Invoices
  Payments
  Tasks
  Workflows
  NEXUS Tool Registration
  Agent / Planner
  Write Actions + Confirmations
  NEXUS API
  ERP NEXUS UI
  Full End-To-End Test

IMPORTANT:
This runner does NOT blindly rewrite source code.
It verifies the live architecture and integration contract,
runs the existing test gate, and records the exact state.

============================================================
Completed: $(Get-Date)
============================================================
"@

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " MASTER INTEGRATION CHECKPOINT COMPLETE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Status: $Status" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT IMPLEMENTATION TARGET: application.list" -ForegroundColor Cyan
