local chatOpen = false
local chatHidden = false
local compactMode = Config.Appearance.compactByDefault == true
local nuiReady = false
local availableChannels = {}
local suggestions = {}
local channelSuggestionNames = {}

-- FiveM does not expose Lua's `os` library to client scripts. GetLocalTime is
-- a native and works identically on QBCore, Qbox, ESX, and standalone servers.
local function currentTimestamp()
    local _, _, _, hour, minute = GetLocalTime()
    return ('%02d:%02d'):format(hour or 0, minute or 0)
end

local function sendNui(action, payload)
    if not nuiReady then return end
    SendNUIMessage({ action = action, payload = payload })
end

local function appearanceSettings()
    return {
        position = Config.Appearance.position,
        width = Config.Appearance.width,
        height = Config.Appearance.height,
        accent = Config.Appearance.accent,
        showTimestamps = Config.Appearance.showTimestamps,
        showPlayerIds = Config.Appearance.showPlayerIds,
        fadeAfter = Config.Appearance.fadeAfter,
        historyRetention = Config.Appearance.historyRetention,
        maxVisibleMessages = Config.Appearance.maxVisibleMessages,
        historyLimit = Config.Appearance.historyLimit,
        maxMessageLength = Config.Security.maxMessageLength,
        compact = compactMode,
        emoji = Config.Emoji,
        channels = availableChannels,
        defaultChannel = Config.DefaultChannel
    }
end

local function pushConfiguration()
    sendNui('configure', appearanceSettings())
    if next(suggestions) then sendNui('suggestions:set', suggestions) end
end

local function closeChat()
    if not chatOpen then return end
    chatOpen = false
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    sendNui('chat:close')
end

local function openChat(initialText)
    if chatOpen or chatHidden or IsPauseMenuActive() then return end
    chatOpen = true
    TriggerServerEvent('bgs_chat:server:requestBootstrap')
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)
    sendNui('chat:open', { initialText = initialText or '' })
end

local function addSystemMessage(text, kind)
    sendNui('message:add', {
        channel = 'system',
        channelLabel = 'SYSTEM',
        color = kind == 'error' and '#FF6577' or '#249EFF',
        author = 'Blu3Forge',
        text = tostring(text or ''),
        timestamp = currentTimestamp(),
        system = true
    })
end

local function normalizeLegacyMessage(message)
    if type(message) == 'string' then
        return {
            channel = 'system',
            channelLabel = 'SYSTEM',
            color = '#249EFF',
            author = '',
            text = message,
            timestamp = currentTimestamp()
        }
    end

    if type(message) ~= 'table' then return nil end
    local args = message.args or {}
    local author = tostring(args[1] or message.author or '')
    local body = {}
    for index = 2, #args do body[#body + 1] = tostring(args[index]) end
    local text = #body > 0 and table.concat(body, ' ') or tostring(message.message or message.text or '')
    if #args == 1 and text == '' then
        text = author
        author = ''
    end
    local color = message.color
    if type(color) == 'table' then
        color = ('#%02X%02X%02X'):format(color[1] or 255, color[2] or 255, color[3] or 255)
    end

    return {
        channel = message.channel or 'external',
        channelLabel = message.channelLabel or message.channel or 'CHAT',
        color = color or '#A9B6C4',
        author = author,
        text = text,
        timestamp = currentTimestamp(),
        system = message.system == true
    }
end

RegisterNUICallback('ready', function(_, callback)
    nuiReady = true
    pushConfiguration()
    TriggerServerEvent('bgs_chat:server:requestBootstrap')
    callback({ ok = true })
end)

RegisterNUICallback('close', function(_, callback)
    closeChat()
    callback({ ok = true })
end)

RegisterNUICallback('submit', function(data, callback)
    local text = tostring(data and data.text or ''):gsub('^%s+', ''):gsub('%s+$', '')
    local channel = tostring(data and data.channel or Config.DefaultChannel)
    closeChat()

    if text == '' then
        callback({ ok = false })
        return
    end

    if text:sub(1, 1) == '/' then
        ExecuteCommand(text:sub(2))
    else
        TriggerServerEvent('bgs_chat:server:sendMessage', channel, text)
    end
    callback({ ok = true })
end)

RegisterCommand('bgs_chat_open', function()
    openChat('')
end, false)

RegisterKeyMapping('bgs_chat_open', 'Open BGS Chat', 'keyboard', Config.OpenKey)

RegisterCommand(Config.Commands.toggle, function()
    chatHidden = not chatHidden
    if chatHidden then closeChat() end
    sendNui('chat:visible', { visible = not chatHidden })
    addSystemMessage(chatHidden and Config.Messages.hidden:format(Config.Commands.toggle) or Config.Messages.shown)
end, false)

RegisterCommand(Config.Commands.compact, function()
    compactMode = not compactMode
    sendNui('chat:compact', { compact = compactMode })
    addSystemMessage(compactMode and Config.Messages.compactOn or Config.Messages.compactOff)
end, false)

RegisterCommand(Config.Commands.clear, function()
    sendNui('messages:clear')
end, false)

RegisterNetEvent('bgs_chat:client:bootstrap', function(channels)
    for name in pairs(channelSuggestionNames) do
        TriggerEvent('chat:removeSuggestion', name)
    end
    channelSuggestionNames = {}
    availableChannels = channels or {}
    pushConfiguration()
    for _, channel in ipairs(availableChannels) do
        if channel.allowed ~= false and channel.command and channel.command ~= '' then
            local commandName = '/' .. channel.command
            channelSuggestionNames[commandName] = true
            TriggerEvent('chat:addSuggestion', commandName, ('Send a message in %s chat'):format(channel.label), {
                { name = 'message', help = 'Message text' }
            })
        end
    end
end)

RegisterNetEvent('bgs_chat:client:message', function(message)
    sendNui('message:add', message)
end)

RegisterNetEvent('bgs_chat:client:system', function(message, kind)
    addSystemMessage(message, kind)
end)

RegisterNetEvent('chat:addMessage', function(message)
    local normalized = normalizeLegacyMessage(message)
    if normalized then sendNui('message:add', normalized) end
end)

RegisterNetEvent('chat:addSuggestion', function(name, help, params)
    if not name then return end
    suggestions[name] = { name = name, help = help or '', params = params or {} }
    sendNui('suggestion:add', suggestions[name])
end)

RegisterNetEvent('chat:addSuggestions', function(items)
    for _, item in ipairs(items or {}) do
        if item.name then suggestions[item.name] = item end
    end
    sendNui('suggestions:set', suggestions)
end)

RegisterNetEvent('chat:removeSuggestion', function(name)
    suggestions[name] = nil
    sendNui('suggestion:remove', { name = name })
end)

RegisterNetEvent('chat:clear', function()
    sendNui('messages:clear')
end)

RegisterNetEvent('chat:addTemplate', function() end)

exports('addMessage', function(message)
    local normalized = normalizeLegacyMessage(message)
    if normalized then sendNui('message:add', normalized) end
end)
exports('addSuggestion', function(name, help, params)
    TriggerEvent('chat:addSuggestion', name, help, params)
end)
exports('removeSuggestion', function(name)
    TriggerEvent('chat:removeSuggestion', name)
end)
exports('clear', function()
    sendNui('messages:clear')
end)
exports('open', openChat)
exports('close', closeChat)
exports('setVisible', function(visible)
    chatHidden = visible == false
    if chatHidden then closeChat() end
    sendNui('chat:visible', { visible = not chatHidden })
end)

CreateThread(function()
    while true do
        if chatOpen and IsPauseMenuActive() then closeChat() end
        Wait(250)
    end
end)

CreateThread(function()
    if not Config.DisableNativeChat then return end

    -- Suppress GTA's built-in ALL, TEAM, FRIENDS, and CREW text-chat controls.
    -- RegisterKeyMapping still receives the configured BGS Chat key normally.
    if SetTextChatEnabled then SetTextChatEnabled(false) end
    while true do
        DisableControlAction(0, 245, true)
        DisableControlAction(0, 246, true)
        DisableControlAction(0, 247, true)
        DisableControlAction(0, 248, true)
        Wait(0)
    end
end)

AddEventHandler('onClientResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    Wait(250)
    TriggerEvent('chat:addSuggestion', '/' .. Config.Commands.toggle, 'Show or hide BGS Chat')
    TriggerEvent('chat:addSuggestion', '/' .. Config.Commands.compact, 'Toggle compact chat mode')
    TriggerEvent('chat:addSuggestion', '/' .. Config.Commands.clear, 'Clear your local chat history')
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
end)
