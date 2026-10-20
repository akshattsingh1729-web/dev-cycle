# Simple lightweight static HTTP server for Dev Cycle Showroom
param(
    [int]$Port = 3000
)

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  DEV CYCLE - 3D Showroom Server running at:" -ForegroundColor Cyan
    Write-Host "  http://localhost:$Port" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
} catch {
    Write-Host "Failed to start listener on port ${Port}: $_" -ForegroundColor Red
    exit 1
}

$baseDir = $PSScriptRoot

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($urlPath)) {
            $urlPath = "index.html"
        }

        # Dynamic /env.js endpoint to load environment variables from .env
        if ($urlPath -eq "env.js") {
            $envFile = Join-Path $baseDir ".env"
            $urlVal = "https://wzjqntgujuptcfxklcxt.supabase.co"
            $keyVal = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6anFudGd1anVwdGNmeGtsY3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzk5MDUsImV4cCI6MjEwNzY1NTkwNX0.T3BZ_QPrXUcww0nByZLWxa-hB6dhH7yqkH9ItWPQFyc"
            if (Test-Path $envFile -PathType Leaf) {
                Get-Content $envFile | ForEach-Object {
                    $line = $_.Trim()
                    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
                        $parts = $line.Split("=", 2)
                        $k = $parts[0].Trim()
                        $v = $parts[1].Trim().Trim('"').Trim("'")
                        if ($k -eq "VITE_SUPABASE_URL") { $urlVal = $v }
                        if ($k -eq "VITE_SUPABASE_ANON_KEY") { $keyVal = $v }
                    }
                }
            }
            $envPayload = "window.__ENV__ = { VITE_SUPABASE_URL: '$urlVal', VITE_SUPABASE_ANON_KEY: '$keyVal' };"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($envPayload)
            $response.ContentType = "application/javascript; charset=utf-8"
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        $filePath = Join-Path $baseDir $urlPath
        $filePath = [System.IO.Path]::GetFullPath($filePath)

        # Security check: must be inside base directory
        if (-not $filePath.StartsWith($baseDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        # If exact file doesn't exist, check for .html extension or directory index.html
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $cleanPath = $urlPath.TrimEnd('/')
            if (Test-Path "$filePath.html" -PathType Leaf) {
                $filePath = "$filePath.html"
            } elseif (Test-Path (Join-Path $filePath "index.html") -PathType Leaf) {
                $filePath = Join-Path $filePath "index.html"
            } elseif (($cleanPath -eq "auth/callback") -and (Test-Path (Join-Path $baseDir "auth-callback.html"))) {
                $filePath = Join-Path $baseDir "auth-callback.html"
            }
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "text/plain; charset=utf-8" }
            $response.ContentType = $contentType
            $response.AddHeader("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.Close()
    } catch {
        # continue listening
    }
}
