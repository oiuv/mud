@echo off
if not exist "driver.exe" (
    echo driver.exe not found, please compile with build_msys2.sh...
    pause
) else (
    start /B "" "driver.exe" "config.cfg"
    color 02
)
