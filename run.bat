@echo off
if not exist "bin\driver.exe" (
    echo driver.exe not found, please compile with build_msys2.sh...
    pause
) else (
    start /B "" "bin\driver.exe" "config.cfg"
    color 02
)
