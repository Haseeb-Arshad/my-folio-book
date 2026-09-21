param(
  [ValidateRange(1, 24)]
  [int]$IntervalHours = 4
)

$ErrorActionPreference = "Stop"

$taskName = "Haseeb AI Usage Sync"
$runner = Join-Path $PSScriptRoot "run-ai-usage-sync.ps1"
$powershell = Join-Path ${env:SystemRoot} "System32\WindowsPowerShell\v1.0\powershell.exe"
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

$action = New-ScheduledTaskAction `
  -Execute $powershell `
  -Argument ("-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"" + $runner + "`"")

$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Hours $IntervalHours) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -MultipleInstances IgnoreNew

$principal = New-ScheduledTaskPrincipal `
  -UserId $currentUser `
  -LogonType Interactive `
  -RunLevel Limited

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Description "Publish local AI usage aggregates to the haseeb-ai-usage Cloudflare Worker every $IntervalHours hours." `
  -Force | Out-Null

Get-ScheduledTask -TaskName $taskName |
  Select-Object TaskName, State, Author, Description
