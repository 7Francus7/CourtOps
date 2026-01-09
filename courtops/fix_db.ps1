$content = Get-Content .env
$newContent = $content -replace 'postgres://', 'postgresql://'
$newContent | Set-Content .env -Encoding UTF8
Write-Host "✅ .env file fixed (protocol updated)."
Write-Host "🚀 Starting database synchronization..."
cmd /c "npx prisma db push"
