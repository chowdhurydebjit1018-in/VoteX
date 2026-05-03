$ErrorActionPreference = "Stop"

# Create root directories
New-Item -ItemType Directory -Force -Path frontend | Out-Null
New-Item -ItemType Directory -Force -Path backend | Out-Null
New-Item -ItemType Directory -Force -Path firebase | Out-Null

# Move frontend files
$frontendFiles = @("public", "src", "dist", "node_modules", ".env", ".env.example", "index.html", "package.json", "package-lock.json", "tsconfig.json", "vite.config.ts")
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination frontend\ -Force
    }
}

# Create missing frontend/src folders according to the tree
New-Item -ItemType Directory -Force -Path frontend\src\components\ui | Out-Null
New-Item -ItemType Directory -Force -Path frontend\src\features\chat | Out-Null
New-Item -ItemType Directory -Force -Path frontend\src\features\journey | Out-Null
New-Item -ItemType Directory -Force -Path frontend\src\features\timeline | Out-Null
New-Item -ItemType Directory -Force -Path frontend\src\features\location | Out-Null
New-Item -ItemType Directory -Force -Path frontend\src\features\onboarding | Out-Null
New-Item -ItemType Directory -Force -Path frontend\src\context | Out-Null
New-Item -ItemType Directory -Force -Path frontend\src\routes | Out-Null

# Move features from frontend/src/components/features to frontend/src/features
if (Test-Path frontend\src\components\features\Chat.tsx) { Move-Item frontend\src\components\features\Chat.tsx frontend\src\features\chat\ }
if (Test-Path frontend\src\components\features\Journey.tsx) { Move-Item frontend\src\components\features\Journey.tsx frontend\src\features\journey\ }
if (Test-Path frontend\src\components\features\Location.tsx) { Move-Item frontend\src\components\features\Location.tsx frontend\src\features\location\ }
if (Test-Path frontend\src\components\features\Onboarding.tsx) { Move-Item frontend\src\components\features\Onboarding.tsx frontend\src\features\onboarding\ }
if (Test-Path frontend\src\components\features\Timeline.tsx) { Move-Item frontend\src\components\features\Timeline.tsx frontend\src\features\timeline\ }

if (Test-Path frontend\src\components\features) { Remove-Item -Recurse -Force frontend\src\components\features }

# Create empty files asked in frontend tree if they don't exist
New-Item -ItemType File -Force -Path frontend\src\features\chat\ChatInput.tsx | Out-Null
New-Item -ItemType File -Force -Path frontend\src\features\chat\ChatMessage.tsx | Out-Null
New-Item -ItemType File -Force -Path frontend\src\features\chat\chat.api.ts | Out-Null
New-Item -ItemType File -Force -Path frontend\src\features\journey\journey.api.ts | Out-Null
New-Item -ItemType File -Force -Path frontend\src\context\AuthContext.tsx | Out-Null
New-Item -ItemType File -Force -Path frontend\src\context\AppContext.tsx | Out-Null
New-Item -ItemType File -Force -Path frontend\src\lib\api.ts | Out-Null
New-Item -ItemType File -Force -Path frontend\src\routes\index.tsx | Out-Null

# Move types.ts to types/index.ts
New-Item -ItemType Directory -Force -Path frontend\src\types | Out-Null
if (Test-Path frontend\src\types.ts) { Move-Item frontend\src\types.ts frontend\src\types\index.ts -Force }

# Backend Scaffold
$backendDirs = @(
    "backend\app\api\v1\routes",
    "backend\app\services",
    "backend\app\ai\pipelines",
    "backend\app\ai\prompts",
    "backend\app\core",
    "backend\app\models"
)
foreach ($dir in $backendDirs) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

# Backend Files
New-Item -ItemType File -Force -Path backend\app\main.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\api\v1\routes\chat.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\api\v1\routes\journey.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\api\v1\routes\timeline.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\api\v1\routes\location.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\api\v1\routes\router.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\services\chat_service.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\services\journey_service.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\services\timeline_service.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\llm_client.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\pipelines\intent.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\pipelines\rag.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\pipelines\journey.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\pipelines\timeline.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\prompts\intent.txt | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\prompts\journey.txt | Out-Null
New-Item -ItemType File -Force -Path backend\app\ai\prompts\timeline.txt | Out-Null
New-Item -ItemType File -Force -Path backend\app\core\config.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\core\security.py | Out-Null
New-Item -ItemType File -Force -Path backend\app\models\user.py | Out-Null
New-Item -ItemType File -Force -Path backend\requirements.txt | Out-Null
New-Item -ItemType File -Force -Path backend\Dockerfile | Out-Null
New-Item -ItemType File -Force -Path backend\.env | Out-Null

# Firebase Configs
$firebaseFiles = @("firebase.json", "firestore.rules", ".firebaserc", "firebase-applet-config.json", "firebase-blueprint.json")
foreach ($file in $firebaseFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination firebase\ -Force
    } elseif ("firebase.json", "firestore.rules", ".firebaserc" -contains $file) {
        New-Item -ItemType File -Force -Path firebase\$file | Out-Null
    }
}

# Top-level files
if (!(Test-Path cloudbuild.yaml)) { New-Item -ItemType File -Force -Path cloudbuild.yaml | Out-Null }
