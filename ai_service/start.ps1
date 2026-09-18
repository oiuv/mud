# Windows PowerShell 5.1+ launcher. ASCII source also works without a UTF-8 BOM.
param(
    [ValidateSet("setup", "start", "stop", "restart", "status", "logs", "run", "help")]
    [string]$Command = "start",
    [Alias("d")]
    [switch]$ServiceDebug
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$serviceDir = $PSScriptRoot
$venvPython = Join-Path $serviceDir ".venv\Scripts\python.exe"
$runDir = Join-Path $serviceDir ".run"
$stateFile = Join-Path $runDir "windows-service.json"
$logFile = Join-Path $serviceDir "logs\ai_service.log"
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8
$controlLock = $null

function Get-ServiceState {
    if (-not (Test-Path -LiteralPath $stateFile)) { return $null }
    try {
        $state = Get-Content -LiteralPath $stateFile -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($state.RunId -notmatch '^[a-f0-9]{32}$') { return $null }
        $process = Get-Process -Id ([int]$state.ProcessId) -ErrorAction SilentlyContinue
        if ($null -eq $process -or $process.HasExited) { return $null }
        if ([string]$process.StartTime.ToUniversalTime().Ticks -ne [string]$state.StartTicks) { return $null }
        return $state
    } catch { return $null }
}

function Invoke-Python {
    param([string]$Interpreter, [string[]]$PythonArgs)
    & $Interpreter @PythonArgs
    if ($LASTEXITCODE -ne 0) { throw "Python command failed (exit $LASTEXITCODE)." }
}

function Assert-Environment {
    if (-not (Test-Path -LiteralPath $venvPython)) {
        throw "Virtual environment missing. Run: start.bat setup"
    }
    if (-not (Test-Path -LiteralPath (Join-Path $serviceDir ".env"))) {
        throw "Configuration missing. Run setup, then edit ai_service\.env."
    }
    Invoke-Python $venvPython @("-X", "utf8", "-c", "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 'Python 3.10+ required')")
}

function Initialize-Environment {
    if ($null -ne (Get-ServiceState)) { throw "Stop the service before updating dependencies." }
    $pythonArgs = @()
    if ($env:AI_PYTHON) {
        $python = $env:AI_PYTHON
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        $python = (Get-Command python).Source
    } elseif (Get-Command py -ErrorAction SilentlyContinue) {
        $python = (Get-Command py).Source
        $pythonArgs = @("-3")
    } else { throw "Install Python 3.10+ or set AI_PYTHON to python.exe." }
    Invoke-Python $python ($pythonArgs + @("-c", "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 'Python 3.10+ required')"))
    if (-not (Test-Path -LiteralPath $venvPython)) {
        Invoke-Python $python ($pythonArgs + @("-m", "venv", (Join-Path $serviceDir ".venv")))
    }
    Invoke-Python $venvPython @("-m", "pip", "install", "-r", (Join-Path $serviceDir "requirements.txt"))
    foreach ($name in @(".env", "config\npc_roles.json")) {
        $target = Join-Path $serviceDir $name
        if (-not (Test-Path -LiteralPath $target)) {
            $example = if ($name -eq ".env") { ".env.example" } else { "config\npc_roles.example.json" }
            Copy-Item -LiteralPath (Join-Path $serviceDir $example) -Destination $target
        }
    }
    Write-Host "Setup complete. Edit ai_service\.env, then run start.bat start."
}

function Start-AIService {
    param([bool]$Foreground = $false)
    $state = Get-ServiceState
    if ($null -ne $state) {
        if ($Foreground) { throw "Service already running (PID $($state.ProcessId))." }
        Write-Host "Service already running (PID $($state.ProcessId))."
        return
    }
    Assert-Environment
    Write-Host "Checking and updating the knowledge base..."
    Invoke-Python $venvPython @("-X", "utf8", (Join-Path $serviceDir "scripts\update_knowledge.py"))
    $runId = [Guid]::NewGuid().ToString("N")
    $stopFile = Join-Path $runDir ("stop-" + $runId + ".request")
    $runner = Join-Path $serviceDir "scripts\run_service.py"
    # Start-Process joins ArgumentList: quote paths explicitly for spaces and Unicode.
    $argumentLine = '-X utf8 -u "' + $runner + '" --stop-file "' + $stopFile + '"'
    if (-not $Foreground) { $argumentLine += ' --log-file "' + $logFile + '"' }
    if ($ServiceDebug) { $argumentLine += " -d" }
    $options = @{
        FilePath = $venvPython
        ArgumentList = $argumentLine
        WorkingDirectory = $serviceDir
        PassThru = $true
    }
    if ($Foreground) { $options.NoNewWindow = $true } else { $options.WindowStyle = "Hidden" }
    $process = Start-Process @options
    try {
        # Retain the native handle so Windows PowerShell can read ExitCode after exit.
        $null = $process.Handle
        $state = @{
            ProcessId = $process.Id
            StartTicks = [string]$process.StartTime.ToUniversalTime().Ticks
            RunId = $runId
        }
        [IO.File]::WriteAllText($stateFile, ($state | ConvertTo-Json -Compress), $utf8)
        Start-Sleep -Seconds 2
        $process.Refresh()
        if ($process.HasExited) {
            Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
            if (Test-Path -LiteralPath $logFile) { Get-Content -LiteralPath $logFile -Tail 30 -Encoding UTF8 }
            throw "Service exited during startup. See $logFile"
        }
    } catch {
        # If state registration fails, ask only this newly launched instance to exit.
        [IO.File]::WriteAllText($stopFile, "stop", $utf8)
        throw
    }
    Write-Host "AI service running (PID $($process.Id))."
    if ($Foreground) {
        # Other management commands must be able to request shutdown while we wait.
        $script:controlLock.Dispose()
        $script:controlLock = $null
        try {
            while (-not $process.WaitForExit(250)) { }
            if ($process.ExitCode -ne 0) { throw "Service exited with code $($process.ExitCode)." }
        } finally {
            # Ctrl+C also asks this instance to shut down without killing active requests.
            if (-not $process.HasExited) { [IO.File]::WriteAllText($stopFile, "stop", $utf8) }
        }
    } else { Write-Host "Log: $logFile" }
}

function Stop-AIService {
    $state = Get-ServiceState
    if ($null -eq $state) {
        Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
        Write-Host "AI service is not running."
        return
    }
    $stopFile = Join-Path $runDir ("stop-" + $state.RunId + ".request")
    [IO.File]::WriteAllText($stopFile, "stop", $utf8)
    Write-Host "Stopping PID $($state.ProcessId); waiting for active requests..."
    $deadline = [DateTime]::UtcNow.AddSeconds($stopTimeout)
    while ($null -ne (Get-ServiceState)) {
        if ([DateTime]::UtcNow -ge $deadline) {
            throw "Stop timed out. Process and state preserved; increase AI_STOP_TIMEOUT and retry."
        }
        Start-Sleep -Milliseconds 250
    }
    Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $stopFile -Force -ErrorAction SilentlyContinue
    Write-Host "AI service stopped."
}

try {
    if ($Command -eq "help") {
        Write-Host @"
Usage: start.bat [setup|start|stop|restart|status|logs|run|help] [-d]
Default: start. Startup automatically synchronizes BM25 and missing vectors.
setup: create .venv, install requirements, copy missing configuration templates.
run: foreground mode. start: background mode with logs/ai_service.log.
AI_PYTHON selects Python for setup. AI_STOP_TIMEOUT defaults to 90 seconds.
"@
        exit 0
    }
    if ($ServiceDebug -and $Command -notin @("start", "restart", "run")) {
        throw "-d is supported only by start, restart and run."
    }
    $stopTimeoutText = if ($env:AI_STOP_TIMEOUT) { $env:AI_STOP_TIMEOUT } else { "90" }
    if ($stopTimeoutText -notmatch '^[1-9][0-9]{0,5}$') { throw "AI_STOP_TIMEOUT must be an integer from 1 to 999999." }
    $stopTimeout = [int]$stopTimeoutText
    if ($Command -eq "status") {
        $state = Get-ServiceState
        if ($null -eq $state) { Write-Host "AI service is not running."; exit 3 }
        Write-Host "AI service running (PID $($state.ProcessId)). Log: $logFile"
        exit 0
    }
    if ($Command -eq "logs") {
        if (-not (Test-Path -LiteralPath $logFile)) { throw "No log yet. Start the service first." }
        Get-Content -LiteralPath $logFile -Encoding UTF8 -Tail 100 -Wait
        exit 0
    }
    [IO.Directory]::CreateDirectory($runDir) | Out-Null
    try {
        $controlLock = [IO.File]::Open((Join-Path $runDir "windows-control.lock"),
            [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    } catch { throw "Another management command is running; retry later." }
    switch ($Command) {
        "setup" { Initialize-Environment }
        "start" { Start-AIService }
        "stop" { Stop-AIService }
        "restart" { Stop-AIService; Start-AIService }
        "run" { Start-AIService -Foreground $true }
    }
    exit 0
} catch {
    [Console]::Error.WriteLine("Error: " + $_.Exception.Message)
    exit 1
} finally {
    if ($null -ne $controlLock) { $controlLock.Dispose() }
}
