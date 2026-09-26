param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('project', 'publication', 'article', 'note')]
    [string]$Type,
    [Parameter(Mandatory = $true)]
    [ValidateSet('en', 'es')]
    [string]$Language,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9]+(-[a-z0-9]+)*$')]
    [string]$Slug,
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Title
)
$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path -Parent $PSScriptRoot
$folders = @{ project = 'projects'; publication = 'publications'; article = 'writing'; note = 'notes' }
$templatePath = Join-Path $siteRoot "templates/$Type-$Language.md"
$targetPath = Join-Path $siteRoot "_$($folders[$Type])/$Slug-$Language.md"
if (Test-Path -LiteralPath $targetPath) { throw "An entry already exists at $targetPath. Choose another slug." }
$entryText = Get-Content -LiteralPath $templatePath -Raw -Encoding UTF8
$titleYaml = ConvertTo-Json -InputObject $Title -Compress
$entryText = [regex]::Replace($entryText, '(?m)^title: .*$', [System.Text.RegularExpressions.MatchEvaluator]{ param($match) "title: $titleYaml" })
$entryText = $entryText.Replace('your-slug', $Slug)
$entryText = $entryText.Replace('2026-09-26', (Get-Date -Format 'yyyy-MM-dd'))
$targetDirectory = Split-Path -Parent $targetPath
New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
# CreateNew makes accidental overwrites impossible, including concurrent invocations.
$stream = [System.IO.File]::Open($targetPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write)
try {
    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($entryText)
    $stream.Write($bytes, 0, $bytes.Length)
} finally { $stream.Dispose() }
Write-Output "Created: $targetPath"
Write-Output 'Fill in the summary and body, then change published: false to published: true when ready.'
