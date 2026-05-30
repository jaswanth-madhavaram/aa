import os
import shutil
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
venv = root / 'venv'

print('CWD:', root)
print('venv exists:', venv.exists())
if venv.exists():
    print('Removing old venv...')
    shutil.rmtree(venv)

print('Creating new venv...')
res = subprocess.run([sys.executable, '-m', 'venv', str(venv)], cwd=root)
print('venv creation rc:', res.returncode)
print('venv dir list:', [p.name for p in venv.iterdir()])
py = venv / 'Scripts' / 'python.exe'
if not py.exists():
    py = venv / 'bin' / 'python'
print('python exists:', py.exists(), py)
if py.exists():
    print('Upgrading pip...')
    res2 = subprocess.run([str(py), '-m', 'pip', 'install', '--upgrade', 'pip'])
    print('pip upgrade rc:', res2.returncode)
    print('Installing requirements...')
    res3 = subprocess.run([str(py), '-m', 'pip', 'install', '-r', str(root / 'requirements.txt')])
    print('requirements rc:', res3.returncode)
else:
    print('python executable missing after venv creation')
