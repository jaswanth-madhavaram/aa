$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$venvPath = Join-Path $root 'venv'
$pythonInVenv = Join-Path $venvPath 'Scripts\python.exe'
$pipInVenv = Join-Path $venvPath 'Scripts\pip.exe'

function Create-Venv {
    Write-Host 'Creating Windows virtual environment...'
    python -m venv venv
}

function Install-Requirements {
    Write-Host 'Upgrading pip...'
    & $pythonInVenv -m pip install --upgrade pip
    Write-Host 'Installing requirements...'
    & $pipInVenv install -r "$root\requirements.txt"
}

if (-Not (Test-Path $pythonInVenv)) {
    if (Test-Path $venvPath) {
        Write-Host 'Removing incompatible venv...'
        Remove-Item -LiteralPath $venvPath -Recurse -Force
    }
    Create-Venv
}

if (-Not (Test-Path $pythonInVenv)) {
    throw 'Failed to create a usable Windows venv. Ensure Python is installed and available on PATH.'
}

Install-Requirements

Write-Host 'Starting Medico.AI...'
& $pythonInVenv "$root\start.py"
