#!/bin/bash

npm install pm2@latest -g
npm install
pm2 restart tg_bot
whereis pm2
whoami
node -v
echo 'tg_bot restarted succesfully'