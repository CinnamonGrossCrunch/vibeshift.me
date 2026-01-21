# Test script to check if accounting ICS files are loading
# Run this in a SEPARATE terminal while npm run dev is running

Write-Host "Testing calendar API for accounting events..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/calendar" -UseBasicParsing -TimeoutSec 60
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "`n=== BLUE COHORT ACCOUNTING EVENTS ===" -ForegroundColor Blue
    $blueAccounting = $data.blue | Where-Object { $_.source -like "*accounting*" }
    if ($blueAccounting) {
        $blueAccounting | Select-Object -First 5 title, start, source | Format-Table -AutoSize
        Write-Host "Total Blue accounting events: $($blueAccounting.Count)" -ForegroundColor Green
    } else {
        Write-Host "No accounting events found in Blue cohort!" -ForegroundColor Red
    }
    
    Write-Host "`n=== GOLD COHORT ACCOUNTING EVENTS ===" -ForegroundColor Yellow
    $goldAccounting = $data.gold | Where-Object { $_.source -like "*accounting*" }
    if ($goldAccounting) {
        $goldAccounting | Select-Object -First 5 title, start, source | Format-Table -AutoSize
        Write-Host "Total Gold accounting events: $($goldAccounting.Count)" -ForegroundColor Green
    } else {
        Write-Host "No accounting events found in Gold cohort!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nMake sure npm run dev is running in another terminal!" -ForegroundColor Yellow
}
