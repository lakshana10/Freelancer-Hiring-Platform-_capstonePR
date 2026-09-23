<#
  Loads a backend env file into THIS PowerShell session, then starts
  Spring Boot. Secrets stay on disk (gitignored) and never enter git.

  Spring Boot does not read .env files natively, so this script is the
  bridge: it parses KEY=VALUE lines and exports them as process env vars
  before launching the JVM.

  Usage:
    # If script execution is disabled (Windows default), bypass it:
    powershell -ExecutionPolicy Bypass -File .\run-local.ps1

    .\run-local.ps1                          # defaults to .env.development
    .\run-local.ps1 -EnvFile .env.production
#>
param(
    [string]$EnvFile = ".env.development"
)

$ErrorActionPreference = "Stop"
$path = Join-Path $PSScriptRoot $EnvFile

if (-not (Test-Path $path)) {
    throw "Missing env file: $path`nCopy .env.example to $EnvFile and fill in the values."
}

Write-Host "Loading $EnvFile ..." -ForegroundColor Cyan

Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    # Skip blanks and comments.
    if ($line -and -not $line.StartsWith("#")) {
        # Split on the FIRST '=' only, so values may contain '='.
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            if ($key) {
                [Environment]::SetEnvironmentVariable($key, $value, 'Process')
                # Mask anything that looks like a secret.
                if ($key -match 'PASSWORD|SECRET') {
                    Write-Host ("  {0}=<set>" -f $key) -ForegroundColor DarkGray
                } else {
                    Write-Host ("  {0}={1}" -f $key, $value) -ForegroundColor DarkGray
                }
            }
        }
    }
}

$maven = Join-Path $PSScriptRoot "mvnw.cmd"
if (-not (Test-Path $maven)) { $maven = Join-Path $PSScriptRoot "mvnw" }

Write-Host "Starting Spring Boot ..." -ForegroundColor Cyan
& $maven spring-boot:run
