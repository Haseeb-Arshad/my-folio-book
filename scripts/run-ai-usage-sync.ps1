$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "outputs\ai-usage"
$logPath = Join-Path $logDir "sync.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Add-Content -LiteralPath $logPath -Value ("`n--- AI usage sync started " + (Get-Date).ToString("o") + " ---")

$exitCode = 1

try {
  Push-Location -LiteralPath $root

  $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
  $npm = if ($npmCommand) {
    $npmCommand.Source
  } else {
    Join-Path ${env:ProgramFiles} "nodejs\npm.cmd"
  }

  if (-not (Test-Path -LiteralPath $npm)) {
    throw "npm.cmd was not found."
  }

  # Run npm through ProcessStartInfo so provider diagnostics written to stderr
  # are captured as text instead of being promoted to PowerShell errors.
  $processInfo = [System.Diagnostics.ProcessStartInfo]::new()
  $processInfo.FileName = $npm
  $processInfo.Arguments = "run stats:publish"
  $processInfo.WorkingDirectory = $root
  $processInfo.UseShellExecute = $false
  $processInfo.CreateNoWindow = $true
  $processInfo.RedirectStandardOutput = $true
  $processInfo.RedirectStandardError = $true

  $process = [System.Diagnostics.Process]::new()
  $process.StartInfo = $processInfo
  $process.Start() | Out-Null
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $process.WaitForExit()
  [System.Threading.Tasks.Task]::WaitAll($stdoutTask, $stderrTask)

  if ($stdoutTask.Result) {
    Add-Content -LiteralPath $logPath -Value $stdoutTask.Result
  }
  if ($stderrTask.Result) {
    Add-Content -LiteralPath $logPath -Value $stderrTask.Result
  }
  $exitCode = $process.ExitCode
  $process.Dispose()
} catch {
  Add-Content -LiteralPath $logPath -Value ("sync error: " + $_.Exception.Message)
  $exitCode = 1
} finally {
  Pop-Location
}

Add-Content -LiteralPath $logPath -Value ("--- AI usage sync finished " + (Get-Date).ToString("o") + " exitCode=" + $exitCode + " ---")
exit $exitCode
