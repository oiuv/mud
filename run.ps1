# Windows PowerShell 5.1+. Keep the source ASCII for BOM-free UTF-8.
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$gameDir = $PSScriptRoot
$driverPath = Join-Path $gameDir "bin\driver.exe"
$configPath = Join-Path $gameDir "config.cfg"
$startupLock = $null
$lockHeld = $false

try {
    if (-not (Test-Path -LiteralPath $driverPath -PathType Leaf)) {
        throw "driver.exe not found. Compile the driver with build_msys2.sh first."
    }
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        throw "Configuration missing: $configPath"
    }
    $driverPath = (Resolve-Path -LiteralPath $driverPath).ProviderPath

    # Serialize launches of this executable within the Windows session.
    $hasher = [Security.Cryptography.SHA256]::Create()
    try {
        $pathBytes = [Text.Encoding]::UTF8.GetBytes($driverPath.ToUpperInvariant())
        $lockId = [BitConverter]::ToString($hasher.ComputeHash($pathBytes)).Replace("-", "")
    } finally {
        $hasher.Dispose()
    }
    $startupLock = [Threading.Mutex]::new($false, "Local\MudDriverStart_$lockId")
    try {
        $lockHeld = $startupLock.WaitOne(10000)
    } catch [Threading.AbandonedMutexException] {
        $lockHeld = $true
    }
    if (-not $lockHeld) {
        throw "Another launch is still in progress. Try again shortly."
    }

    foreach ($candidate in @(Get-CimInstance Win32_Process -Filter "Name='driver.exe'")) {
        if (-not $candidate.ExecutablePath) {
            throw "Cannot inspect driver process $($candidate.ProcessId). Check process access permissions."
        }
        if ([string]::Equals($candidate.ExecutablePath, $driverPath, [StringComparison]::OrdinalIgnoreCase)) {
            Write-Host "Driver already running (PID $($candidate.ProcessId))."
            exit 0
        }
    }

    # Read the same first occurrence and inline comments as the driver.
    $config = @{}
    foreach ($line in Get-Content -LiteralPath $configPath -Encoding UTF8) {
        $entry = ($line -split "#", 2)[0].Trim()
        if ($entry -match "^([^:]+?)\s*:\s*(.*)$") {
            $key = $Matches[1].Trim()
            if (-not $config.ContainsKey($key)) {
                $config[$key] = $Matches[2].Trim()
            }
        }
    }
    $ports = @()
    if ($config.ContainsKey("port number")) {
        $ports += [int]$config["port number"]
    }
    foreach ($index in 1..5) {
        if ($index -eq 1 -and $config.ContainsKey("port number")) { continue }
        $key = "external_port_$index"
        if (-not $config.ContainsKey($key)) { continue }
        if ($config[$key] -notmatch "^(telnet|binary|ascii|MUD|websocket)\s+(\d+)\s*$") {
            throw "Invalid port configuration: $key"
        }
        $ports += [int]$Matches[2]
    }
    if (@($ports | Where-Object { $_ -lt 0 -or $_ -gt 65535 }).Count) {
        throw "Configured port numbers must be between 0 and 65535."
    }
    # Port 0 disables a listener in FluffOS.
    $ports = @($ports | Where-Object { $_ -gt 0 } | Sort-Object -Unique)

    $bindAddresses = @()
    if ($config.ContainsKey("mud ip") -and $config["mud ip"]) {
        $bindAddresses = @([Net.Dns]::GetHostAddresses($config["mud ip"]) |
            ForEach-Object { $_.MapToIPv6().ToString() })
    }
    $bindAll = $bindAddresses.Count -eq 0 -or
        $bindAddresses -contains "::" -or $bindAddresses -contains "::ffff:0:0"
    $listeners = [Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
    $busyPorts = @($listeners | Where-Object {
        $address = $_.Address.MapToIPv6().ToString()
        $ports -contains $_.Port -and (
            $bindAll -or $address -eq "::" -or $address -eq "::ffff:0:0" -or
            $bindAddresses -contains $address
        )
    } | Select-Object -ExpandProperty Port -Unique)
    if ($busyPorts.Count) {
        throw "Configured port(s) already in use: $($busyPorts -join ', '). No driver started."
    }

    $driverProcess = Start-Process -FilePath $driverPath -ArgumentList "config.cfg" `
        -WorkingDirectory $gameDir -WindowStyle Hidden -PassThru
    if ($driverProcess.WaitForExit(1000)) {
        throw "Driver exited during startup (exit $($driverProcess.ExitCode)). Check log\debug.log."
    }
    Write-Host "Driver process started (PID $($driverProcess.Id)). Log: $gameDir\log\debug.log"
} catch {
    [Console]::Error.WriteLine("Error: " + $_.Exception.Message)
    exit 1
} finally {
    if ($lockHeld) { $startupLock.ReleaseMutex() }
    if ($null -ne $startupLock) { $startupLock.Dispose() }
}
