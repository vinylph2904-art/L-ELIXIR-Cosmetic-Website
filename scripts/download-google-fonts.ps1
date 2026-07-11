<#
Download Google Fonts CSS and font files, save them to `src/assets/fonts`,
and generate `fonts.css` that references the local files.

Usage (PowerShell):
  .\scripts\download-google-fonts.ps1

This script fetches the predefined Google Fonts CSS URLs used by the project,
downloads the referenced font files (woff2) into `src/assets/fonts`, and
rewrites the CSS to reference the local files. Run this on a machine with
internet access before building for production.
#>

$ErrorActionPreference = 'Stop'

$outDir = Join-Path $PSScriptRoot '..\src\assets\fonts' | Resolve-Path -Relative
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$fontCssOut = Join-Path $outDir 'fonts.css'
if (Test-Path $fontCssOut) { Remove-Item $fontCssOut -Force }

$googleCssUrls = @(
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans:wght@400;500;600&family=Noto+Serif:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap&subset=vietnamese',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
)

Write-Host "Downloading fonts to: $outDir"

foreach ($cssUrl in $googleCssUrls) {
    Write-Host "Fetching CSS: $cssUrl"
    $cssResponse = Invoke-WebRequest -Uri $cssUrl -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
    $css = $cssResponse.Content

    # Find remote font URLs (woff2, woff)
    $matches = [regex]::Matches($css, 'url\((https?:\\/\\/[^)]+)\)')
    foreach ($m in $matches) {
        $remote = $m.Groups[1].Value
        $uri = [System.Uri]$remote
        $name = [System.IO.Path]::GetFileName($uri.AbsolutePath)
        $localPath = "./assets/fonts/$name"
        $localFile = Join-Path $outDir $name

        if (-not (Test-Path $localFile)) {
            Write-Host "Downloading $remote -> $localFile"
            Invoke-WebRequest -Uri $remote -OutFile $localFile -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
        } else {
            Write-Host "Already downloaded: $name"
        }

        $css = $css -replace [regex]::Escape($remote), $localPath
    }

    # Append processed CSS to fonts.css
    Add-Content -Path $fontCssOut -Value "/* CSS from: $cssUrl */`n"
    Add-Content -Path $fontCssOut -Value $css
    Add-Content -Path $fontCssOut -Value "`n`n"
}

Write-Host "Generated: $fontCssOut"
Write-Host "Done. Run 'npm run build' after verifying the files in src/assets/fonts'"
