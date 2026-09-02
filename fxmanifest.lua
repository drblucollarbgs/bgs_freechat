fx_version 'cerulean'
game 'gta5'

author 'Blu3Forge Gaming Studio'
description 'A free, modern, secure, and configurable FiveM chat replacement.'
version '1.0.9'
lua54 'yes'
ui_page 'html/index.html'

shared_script 'config.lua'

client_script 'client/main.lua'
server_script 'server/main.lua'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}

escrow_ignore {
    'config.lua',
    'html/index.html',
    'html/style.css',
    'html/app.js'
}
