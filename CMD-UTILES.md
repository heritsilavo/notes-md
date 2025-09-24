adb tcpip 5555
adb connect 192.168.1.249:5555
yarn android --device=192.168.1.249:5555


adb connect 192.168.1.188:5555
yarn android --device=192.168.1.188:5555

# Lister tous les appareils/émulateurs connectés
adb devices

# Arrêter un émulateur spécifique (remplacez emulator-5554 par votre ID)
adb -s emulator-5554 emu kill

