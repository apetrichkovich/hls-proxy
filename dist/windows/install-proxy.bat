if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)
cd %~dp0
net stop "Proxy Service"
sc delete "Proxy Service"
reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT
if %OS%==32BIT bin\nssm-2.24\win32\nssm.exe install "Proxy Service" %cd%\bin\proxy-win.exe
if %OS%==64BIT bin\nssm-2.24\win64\nssm.exe install "Proxy Service" %cd%\bin\proxy-win.exe
net start "Proxy Service"
set /p DUMMY=Press ENTER to continue...