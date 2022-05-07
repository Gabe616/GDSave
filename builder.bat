@echo off
rmdir build /s /q
rmdir GDSave-win32-x64 /s /q
mkdir build
electron-packager . GDSave --platform=win32 --arch=x64 --icon=src/icon/icon.ico
node builder
pause