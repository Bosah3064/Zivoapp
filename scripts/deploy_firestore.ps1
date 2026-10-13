# Automated Firebase Deployment & Database Seeder Script for Zivo App
# Project ID: zivoapp-92405

$projectId = "zivoapp-92405"
$apiKey = "AIzaSyB_0UXOS4fsaOvuOoOF0bLlpu12P_XW9s0"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "ZIVO FIREBASE DATABASE AND RULES MANAGER" -ForegroundColor Cyan
Write-Host "Project: $projectId" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check if Firestore Database is provisioned
Write-Host "`n[1/3] Verifying Cloud Firestore database status..." -ForegroundColor White
$firestoreUrl = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents?key=$apiKey"

$databaseReady = $false
try {
    $response = Invoke-RestMethod -Uri $firestoreUrl -Method Get -ErrorAction Stop
    Write-Host "[OK] Firestore Database '(default)' is ACTIVE and ready!" -ForegroundColor Green
    $databaseReady = $true
} catch {
    $statusCode = 0
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    if ($statusCode -eq 404) {
        Write-Host "[WAITING] Cloud Firestore is not yet created in your Firebase Console." -ForegroundColor Yellow
        Write-Host "   Open: https://console.firebase.google.com/project/$projectId/firestore" -ForegroundColor Cyan
        Write-Host "   Click 'Create database' -> Production mode -> Choose closest location -> Done" -ForegroundColor White
    } else {
        Write-Host "Status response: $statusCode - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 2. Deploy Rules via Firebase CLI
Write-Host "`n[2/3] Checking Firebase CLI for rule deployment..." -ForegroundColor White
$firebaseCli = Join-Path $PSScriptRoot "..\firebase.exe"
if (Test-Path $firebaseCli) {
    Write-Host "[OK] Standalone Firebase CLI found at: $firebaseCli" -ForegroundColor Green
    Write-Host "To deploy rules to your Firebase project, run:" -ForegroundColor White
    Write-Host "   .\firebase.exe login" -ForegroundColor Yellow
    Write-Host "   .\firebase.exe deploy --only firestore:rules,storage:rules" -ForegroundColor Yellow
} else {
    Write-Host "Standalone Firebase CLI is downloading or available via npm." -ForegroundColor Gray
}

# 3. Seed Starter Data
if ($databaseReady) {
    Write-Host "`n[3/3] Seeding collections into Firestore..." -ForegroundColor White
    
    $profiles = @(
        @{
            id = "user_sophia";
            full_name = "Sophia Chen";
            age = 24;
            gender = "female";
            intent = "dating";
            bio = "Photographer & coffee explorer. Looking for spontaneous road trips.";
            coins = 250;
            is_verified = $true;
            compatibility_score = 94
        },
        @{
            id = "user_marcus";
            full_name = "Marcus Vance";
            age = 27;
            gender = "male";
            intent = "dating";
            bio = "UI designer by day, music producer by night. Let's trade playlists.";
            coins = 180;
            is_verified = $true;
            compatibility_score = 88
        },
        @{
            id = "user_elena";
            full_name = "Elena Rostova";
            age = 23;
            gender = "female";
            intent = "dating";
            bio = "Architecture student & salsa dancer. Always down for art museums.";
            coins = 340;
            is_verified = $true;
            compatibility_score = 91
        }
    )

    foreach ($p in $profiles) {
        $docId = $p.id
        $postUrl = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/profiles?documentId=$docId&key=$apiKey"
        
        $docBody = @{
            fields = @{
                full_name = @{ stringValue = $p.full_name };
                age = @{ integerValue = "$($p.age)" };
                gender = @{ stringValue = $p.gender };
                intent = @{ stringValue = $p.intent };
                bio = @{ stringValue = $p.bio };
                coins = @{ integerValue = "$($p.coins)" };
                is_verified = @{ booleanValue = $p.is_verified };
                compatibility_score = @{ integerValue = "$($p.compatibility_score)" };
                created_at = @{ timestampValue = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") }
            }
        } | ConvertTo-Json -Depth 5

        try {
            $res = Invoke-RestMethod -Uri $postUrl -Method Post -Body $docBody -ContentType "application/json" -ErrorAction Stop
            Write-Host "   [OK] Seeded profile: $($p.full_name) ($docId)" -ForegroundColor Green
        } catch {
            Write-Host "   Could not seed $docId ($($_.Exception.Message))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n[3/3] Data seeding will run once Firestore database is created in Firebase Console." -ForegroundColor Gray
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Completed check." -ForegroundColor Green
