# Install the deploy-to-cloudflare skill on Windows.
# Usage:  powershell -ExecutionPolicy Bypass -File .\install.ps1        -> Claude Code
#         powershell -ExecutionPolicy Bypass -File .\install.ps1 -All   -> also OpenCode and Antigravity
param([switch]$All)
$ErrorActionPreference = "Stop"

$Name = "deploy-to-cloudflare"
$Src  = Join-Path $PSScriptRoot $Name
if (-not (Test-Path (Join-Path $Src "SKILL.md"))) { throw "SKILL.md not found in $Src" }

$HomeDir = $env:USERPROFILE
$Dests = @(Join-Path $HomeDir ".claude\skills")
if ($All) {
  $Dests += Join-Path $HomeDir ".config\opencode\skills"
  $Dests += Join-Path $HomeDir ".gemini\config\skills"
  if (Test-Path (Join-Path $HomeDir ".gemini\antigravity")) {
    $Dests += Join-Path $HomeDir ".gemini\antigravity\skills"
  }
}

foreach ($Dest in $Dests) {
  $Target = Join-Path $Dest $Name
  if (Test-Path $Target) { Remove-Item -Recurse -Force $Target }
  New-Item -ItemType Directory -Force -Path $Dest | Out-Null
  Copy-Item -Recurse $Src $Target
  Write-Host "installed -> $Target"
}

if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host "node: $(node -v)"
} else {
  Write-Host "note: Node.js not found yet - the skill will install it when you ask the AI to deploy."
}
