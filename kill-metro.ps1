$ports = @(8081, 8082, 8083, 8084, 8085)
$killed = 0

foreach ($port in $ports) {
    $lines = netstat -ano | Select-String ":$port "
    foreach ($line in $lines) {
        $parts = ($line.ToString().Trim() -split '\s+')
        $pidStr = $parts[-1]
        if ($pidStr -match '^\d+$' -and [int]$pidStr -gt 0) {
            try {
                Stop-Process -Id ([int]$pidStr) -Force -ErrorAction Stop
                Write-Host "Killed PID $pidStr on port $port"
                $killed++
            } catch {
                Start-Process powershell -ArgumentList "-Command Stop-Process -Id $pidStr -Force" -Verb RunAs -Wait
                Write-Host "Killed PID $pidStr via elevated shell"
                $killed++
            }
        }
    }
}

Get-Process node -ErrorAction SilentlyContinue |
    Where-Object { $_.Handles -gt 1000 } |
    ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
            Write-Host "Killed orphaned Metro node PID $($_.Id)"
            $killed++
        } catch {
            Start-Process powershell -ArgumentList "-Command Stop-Process -Id $($_.Id) -Force" -Verb RunAs -Wait
            $killed++
        }
    }

if ($killed -eq 0) {
    Write-Host "No stuck Metro processes found."
} else {
    Write-Host "$killed process(es) killed. Run: npm run start"
}
