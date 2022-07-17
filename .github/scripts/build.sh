#!/bin/bash

pm2 restart 0
echo 'tg_bot restarted succesfully'
node src/api/initDb.js