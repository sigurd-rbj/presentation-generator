param(
  [Parameter(Mandatory = $true)]
  [string]$PresentationPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
$resolvedPresentation = (Resolve-Path -LiteralPath $PresentationPath).Path
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
Get-ChildItem -LiteralPath $resolvedOutput -Filter 'Slide*.PNG' -File -ErrorAction SilentlyContinue | Remove-Item -Force

$powerPoint = $null
$powerPointProcess = $null
$presentation = $null
$existingPowerPointIds = @(Get-Process POWERPNT -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
$ownsPowerPointInstance = $existingPowerPointIds.Count -eq 0
try {
  try {
    $powerPoint = New-Object -ComObject PowerPoint.Application
  }
  catch {
    $activationError = $_.Exception.Message
    $powerPointPath = Join-Path $env:ProgramFiles 'Microsoft Office\root\Office16\POWERPNT.EXE'
    if (-not (Test-Path -LiteralPath $powerPointPath)) {
      throw "Could not create Microsoft PowerPoint COM application (PowerPoint.Application): $activationError"
    }
    try {
      $powerPointProcess = Start-Process -FilePath $powerPointPath -ArgumentList '/automation' -PassThru
      $powerPoint = [Runtime.InteropServices.Marshal]::GetActiveObject('PowerPoint.Application')
    }
    catch {
      throw "PowerPoint is installed at '$powerPointPath' but COM activation still failed. Initial error: $activationError; retry error: $($_.Exception.Message)"
    }
  }

  $powerPoint.Visible = -1
  $powerPoint.DisplayAlerts = 1
  try { $presentation = $powerPoint.Presentations.Open($resolvedPresentation, $true, $false, $false) }
  catch { throw "PowerPoint could not open the deck for rendering: $($_.Exception.Message)" }
  try { $presentation.Export($resolvedOutput, 'PNG', 1920, 1080) }
  catch { throw "PowerPoint could not export the deck to PNG: $($_.Exception.Message)" }
  Write-Output "Rendered $($presentation.Slides.Count) slides to $resolvedOutput"
}
finally {
  if ($null -ne $presentation) {
    try { $presentation.Close() } catch { Write-Warning "Could not close rendered presentation: $($_.Exception.Message)" }
    try { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) } catch { }
  }
  if ($null -ne $powerPoint) {
    if ($ownsPowerPointInstance) {
      try { $powerPoint.Quit() } catch { Write-Warning "Could not quit PowerPoint cleanly: $($_.Exception.Message)" }
    }
    try { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint) } catch { }
  }
  if ($ownsPowerPointInstance) {
    $rendererProcesses = @(Get-Process POWERPNT -ErrorAction SilentlyContinue | Where-Object { $_.Id -notin $existingPowerPointIds })
    foreach ($process in $rendererProcesses) {
      try {
        if (-not $process.WaitForExit(5000)) { Stop-Process -Id $process.Id -Force }
      }
      catch { Write-Warning "Could not stop renderer-owned PowerPoint process $($process.Id): $($_.Exception.Message)" }
    }
  }
  elseif ($null -ne $powerPointProcess) {
    Write-Warning 'A PowerPoint process was already running; renderer left the existing application open.'
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
