# Kill all Node.js processes
Write-Host "Killing all Node.js processes..."
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to fully terminate
Start-Sleep -Seconds 2

# Clean up .next directory
if (Test-Path ".next") {
    Write-Host "Removing .next directory..."
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

# Clean up node_modules cache
if (Test-Path "node_modules\.cache") {
    Write-Host "Removing node_modules\.cache directory..."
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Cleanup complete! Now run: pnpm run dev"
