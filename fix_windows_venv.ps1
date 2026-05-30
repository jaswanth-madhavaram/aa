$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (Test-Path venv) {
    Write-Host "Removing existing venv..."
    Remove-Item -LiteralPath venv -Recurse -Force
}

Write-Host "Creating new Windows venv..."
python -m venv venv

$python = Join-Path $root "venv\Scripts\python.exe"
$pip = Join-Path $root "venv\Scripts\pip.exe"

if (-not (Test-Path $python)) {
    throw "Python executable not found in venv. Ensure Python is installed and available on PATH."
}

Write-Host "Upgrading pip..."
& $python -m pip install --upgrade pip

Write-Host "Installing project requirements..."
& $pip install -r "$root\requirements.txt"

Write-Host "Windows venv fix complete. Use 'venv\Scripts\activate' and then 'python start.py' to run the app."
