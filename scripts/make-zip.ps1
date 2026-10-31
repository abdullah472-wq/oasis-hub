$distPath = Join-Path (Get-Location) "dist"
$zipPath = Join-Path (Get-Location) "annoor-cpanel-publish.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Collect all files and directories in dist including hidden files like .htaccess
$items = Get-ChildItem -Path $distPath -Force | ForEach-Object { $_.FullName }

Compress-Archive -Path $items -DestinationPath $zipPath -Force

$zipFile = Get-Item $zipPath
Write-Host "Created Zip Archive successfully:"
Write-Host "File Name: $($zipFile.Name)"
Write-Host "File Size: $([math]::Round($zipFile.Length / 1MB, 2)) MB ($($zipFile.Length) bytes)"
Write-Host "Full Path: $($zipFile.FullName)"

