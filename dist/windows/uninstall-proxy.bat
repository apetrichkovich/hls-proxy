if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)
net stop "Proxy Service"
sc delete "Proxy Service"
set /p DUMMY=Press ENTER to continue...