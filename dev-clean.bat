@echo off
echo Killing all node processes...
taskkill /F /IM node.exe 2^
timeout /t 2 /nobreak ^
