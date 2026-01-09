$ErrorActionPreference = "Stop"
try {
       $content = Get-Content .env -Raw
       $lines = $content -split "`r`n"
       foreach ($line in $lines) {
              if ($line -match "^DATABASE_URL=(.*)") {
                     $val = $matches[1].Trim()
                     if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length - 2) }
                     $env:DATABASE_URL = $val
                     break
              }
       }
    
       if ([string]::IsNullOrEmpty($env:DATABASE_URL)) {
              Write-Error "Could not find DATABASE_URL in .env"
       }

       Write-Host "Found DATABASE_URL. Running prisma db push..."
       npx prisma db push --accept-data-loss
}
catch {
       Write-Error $_
}
