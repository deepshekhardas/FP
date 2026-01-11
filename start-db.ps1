# Create data directory if it doesn't exist
$dbPath = Join-Path $PSScriptRoot "data"
if (-not (Test-Path $dbPath)) {
    New-Item -ItemType Directory -Path $dbPath | Out-Null
    Write-Host "Created data directory at $dbPath" -ForegroundColor Green
}

# Common MongoDB installation paths
$possiblePaths = @(
    "C:\Program Files\MongoDB\Server\*\bin\mongod.exe",
    "C:\Program Files (x86)\MongoDB\Server\*\bin\mongod.exe",
    "$env:LOCALAPPDATA\MongoDB\Server\*\bin\mongod.exe",
    "C:\MongoDB\bin\mongod.exe"
)

Write-Host "Searching for mongod.exe..." -ForegroundColor Cyan

$mongodPath = $null
foreach ($path in $possiblePaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $mongodPath = $found.FullName
        break
    }
}

if ($mongodPath) {
    Write-Host "Found MongoDB at: $mongodPath" -ForegroundColor Green
    Write-Host "Starting MongoDB..." -ForegroundColor Cyan
    Write-Host "Keep this window OPEN." -ForegroundColor Yellow
    & $mongodPath --dbpath $dbPath
}
else {
    Write-Host "Could not find mongod.exe in standard locations." -ForegroundColor Red
    Write-Host "Please install MongoDB from: https://www.mongodb.com/try/download/community"
    Write-Host "Or if installed, add it to your PATH."
    Read-Host "Press Enter to exit"
}
