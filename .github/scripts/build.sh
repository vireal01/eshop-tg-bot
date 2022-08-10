#!/bin/bash

pm2 restart all
echo 'tg_bot restarted succesfully'
# node src/api/initDb.js