# Windows PowerShell 5.1+；使用带 BOM 的 UTF-8 编码以兼容中文提示。
param([string]$Command = "start")

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8

$gameDir = $PSScriptRoot
$driverPath = Join-Path $gameDir "bin\driver.exe"
$configPath = Join-Path $gameDir "config.cfg"
$startupLock = $null
$lockHeld = $false

function Show-AiStartupHint {
    Write-Host "如需使用 AI 功能，请单独启动 AI 服务："
    Write-Host "  & `"$gameDir\ai\start.bat`""
}

function Read-DriverConfig {
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        throw "找不到配置文件：$configPath"
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
    return $config
}

function Get-DriverLogPath {
    param([hashtable]$Config)
    $directory = if ($Config["log directory"]) { $Config["log directory"] } else { "log" }
    $filename = if ($Config["debug log file"]) { $Config["debug log file"] } else { "debug.log" }
    # FluffOS joins both entries, then strips leading forward slashes.
    $logName = ("$directory/$filename").TrimStart([char]'/')
    return [IO.Path]::GetFullPath([IO.Path]::Combine($gameDir, $logName))
}

try {
    if ($args.Count -gt 0 -or $Command -notin @("start", "stop", "restart", "status", "run", "logs", "help")) {
        throw "用法：run.bat [start|stop|restart|status|run|logs|help]"
    }
    if ($Command -eq "help") {
        Write-Host @'
用法：run.bat [start|stop|restart|status|run|logs|help]

  start    后台启动游戏驱动（默认）
  stop     直接结束当前项目的游戏驱动
  restart  停止当前项目的驱动后重新后台启动
  status   查看运行状态和进程 ID（PID）
  run      在当前终端前台运行，直接显示驱动输出
  logs     显示最近 100 行驱动日志并持续跟踪
  help     显示此帮助

不带参数时默认执行 start。
run 模式下按 Ctrl+C 停止驱动；logs 模式下只退出日志查看。
status 返回码：0 表示运行中，3 表示未运行。

'@
        Show-AiStartupHint
        exit 0
    }
    if ($Command -eq "logs") {
        $logPath = Get-DriverLogPath (Read-DriverConfig)
        if (-not (Test-Path -LiteralPath $logPath -PathType Leaf)) {
            throw "日志文件尚未生成：$logPath。请先启动游戏驱动。"
        }
        Write-Host "正在跟踪日志：$logPath（最近 100 行）。按 Ctrl+C 退出查看。"
        Get-Content -LiteralPath $logPath -Encoding UTF8 -Tail 100 -Wait
        exit 0
    }
    if ($Command -in @("start", "restart", "run")) {
        if (-not (Test-Path -LiteralPath $driverPath -PathType Leaf)) {
            throw "找不到 driver.exe，请先运行 build_msys2.sh 编译驱动。"
        }
        if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
            throw "找不到配置文件：$configPath"
        }
    }
    if (Test-Path -LiteralPath $driverPath -PathType Leaf) {
        $driverPath = (Resolve-Path -LiteralPath $driverPath).ProviderPath
    }

    # Serialize launcher operations within the Windows session.
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
        throw "另一个驱动管理操作尚未结束，请稍后重试。"
    }

    $runningDrivers = @()
    foreach ($candidate in @(Get-CimInstance Win32_Process -Filter "Name='driver.exe'")) {
        if (-not $candidate.ExecutablePath) {
            throw "无法读取驱动进程 $($candidate.ProcessId) 的路径，请检查进程访问权限。"
        }
        if ([string]::Equals($candidate.ExecutablePath, $driverPath, [StringComparison]::OrdinalIgnoreCase)) {
            $runningDrivers += $candidate
        }
    }

    if ($Command -eq "status") {
        if ($runningDrivers.Count) {
            Write-Host "游戏驱动正在运行（PID $($runningDrivers.ProcessId -join ', ')）。"
            exit 0
        }
        Write-Host "游戏驱动未运行。"
        exit 3
    }

    if ($Command -in @("stop", "restart")) {
        if (-not $runningDrivers.Count) {
            Write-Host "游戏驱动未运行。"
        }
        foreach ($candidate in $runningDrivers) {
            try {
                $driverProcess = [Diagnostics.Process]::GetProcessById([int]$candidate.ProcessId)
            } catch [ArgumentException] {
                # The process exited after it was enumerated.
                continue
            }
            try {
                # Keep a process handle and recheck its path before termination.
                $null = $driverProcess.Handle
                if ($driverProcess.HasExited) { continue }
                if (-not [string]::Equals($driverProcess.MainModule.FileName, $driverPath,
                    [StringComparison]::OrdinalIgnoreCase)) {
                    throw "进程 $($candidate.ProcessId) 已变化，请重新执行 stop。"
                }
                Stop-Process -InputObject $driverProcess -Force -ErrorAction Stop
                if (-not $driverProcess.WaitForExit(10000)) {
                    throw "游戏驱动在 10 秒内未退出（PID $($candidate.ProcessId)）。"
                }
                Write-Host "游戏驱动已停止（PID $($candidate.ProcessId)）。"
            } catch {
                if (-not $driverProcess.HasExited) { throw }
            } finally {
                $driverProcess.Dispose()
            }
        }
        if ($Command -eq "stop") { exit 0 }
        $runningDrivers = @()
    }

    if ($runningDrivers.Count) {
        if ($Command -eq "run") {
            throw "游戏驱动已在运行（PID $($runningDrivers.ProcessId -join ', ')）。请先执行 stop，再使用 run。"
        }
        Write-Host "游戏驱动已在运行（PID $($runningDrivers.ProcessId -join ', ')）。"
        Show-AiStartupHint
        exit 0
    }

    $config = Read-DriverConfig
    $logPath = Get-DriverLogPath $config
    $ports = @()
    if ($config.ContainsKey("port number")) {
        $ports += [int]$config["port number"]
    }
    foreach ($index in 1..5) {
        if ($index -eq 1 -and $config.ContainsKey("port number")) { continue }
        $key = "external_port_$index"
        if (-not $config.ContainsKey($key)) { continue }
        if ($config[$key] -notmatch "^(telnet|binary|ascii|MUD|websocket)\s+(\d+)\s*$") {
            throw "端口配置格式无效：$key"
        }
        $ports += [int]$Matches[2]
    }
    if (@($ports | Where-Object { $_ -lt 0 -or $_ -gt 65535 }).Count) {
        throw "配置中的端口号必须介于 0 和 65535 之间。"
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
        throw "端口已被占用：$($busyPorts -join ', ')，未启动驱动。"
    }

    $startOptions = @{
        FilePath = $driverPath
        ArgumentList = "config.cfg"
        WorkingDirectory = $gameDir
        PassThru = $true
    }
    if ($Command -eq "run") { $startOptions.NoNewWindow = $true }
    else { $startOptions.WindowStyle = "Hidden" }
    $driverProcess = Start-Process @startOptions
    try {
        # Windows PowerShell needs a retained handle to read ExitCode reliably.
        $null = $driverProcess.Handle
        if ($driverProcess.WaitForExit(1000)) {
            if ($Command -eq "run") { exit $driverProcess.ExitCode }
            throw "游戏驱动在启动期间退出（退出码 $($driverProcess.ExitCode)），请查看日志：$logPath"
        }
        Write-Host "游戏驱动已启动（PID $($driverProcess.Id)）。日志：$logPath"
        Show-AiStartupHint
        if ($Command -eq "run") {
            # Permit status/stop/restart from another console while we wait.
            $startupLock.ReleaseMutex()
            $lockHeld = $false
            while (-not $driverProcess.WaitForExit(250)) { }
            exit $driverProcess.ExitCode
        }
    } finally {
        if ($Command -eq "run" -and -not $driverProcess.HasExited) {
            # Ctrl+C reaches the driver too; give its shutdown handler time to finish.
            if (-not $driverProcess.WaitForExit(10000)) {
                Stop-Process -InputObject $driverProcess -Force -ErrorAction Stop
                $null = $driverProcess.WaitForExit(10000)
            }
        }
        $driverProcess.Dispose()
    }
} catch {
    [Console]::Error.WriteLine("错误：" + $_.Exception.Message)
    exit 1
} finally {
    if ($lockHeld) { $startupLock.ReleaseMutex() }
    if ($null -ne $startupLock) { $startupLock.Dispose() }
}
