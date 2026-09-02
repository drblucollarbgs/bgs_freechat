local lastMessageAt = {}
local channelLookup = {}

for _, channel in ipairs(Config.Channels) do channelLookup[channel.id] = channel end

local function detectFramework()
    if Config.Framework ~= 'auto' then return Config.Framework end
    if GetResourceState('qbx_core') == 'started' then return 'qbox' end
    if GetResourceState('qb-core') == 'started' then return 'qb' end
    if GetResourceState('es_extended') == 'started' then return 'esx' end
    return 'standalone'
end

local function getJobInfo(source)
    local framework = detectFramework()
    local ok, job = pcall(function()
        if framework == 'qb' then
            local core = exports['qb-core']:GetCoreObject()
            local player = core.Functions.GetPlayer(source)
            return player and player.PlayerData and player.PlayerData.job or nil
        elseif framework == 'qbox' then
            local player = exports.qbx_core:GetPlayer(source)
            return player and player.PlayerData and player.PlayerData.job or nil
        elseif framework == 'esx' then
            local esx = exports.es_extended:getSharedObject()
            local player = esx.GetPlayerFromId(source)
            return player and player.job or nil
        end
        return nil
    end)
    if not ok or not job then return nil end
    return {
        name = job.name,
        onDuty = job.onduty == nil and true or job.onduty == true
    }
end

local function jobHasAccess(source, channel)
    local job = getJobInfo(source)
    if not job or not job.name then return false end
    if channel.requireDuty == true and not job.onDuty then return false end
    for _, allowedJob in ipairs(channel.requiredJobs or {}) do
        if job.name == allowedJob then return true end
    end
    return false
end

local function hasChannelAccess(source, channel)
    if not channel or channel.enabled ~= true then return false end
    if channel.ace and not IsPlayerAceAllowed(source, channel.ace) then return false end
    if channel.mode == 'job' and not jobHasAccess(source, channel) then return false end
    return true
end

local function availableChannels(source)
    local channels = {}
    for _, channel in ipairs(Config.Channels) do
        if channel.enabled == true then
            channels[#channels + 1] = {
                id = channel.id,
                label = channel.label,
                prefix = channel.prefix,
                color = channel.color,
                command = channel.command,
                allowed = hasChannelAccess(source, channel)
            }
        end
    end
    return channels
end

local function cleanText(value)
    local text = tostring(value or '')
    text = text:gsub('[\r\n\t]', ' '):gsub('%s+', ' '):gsub('^%s+', ''):gsub('%s+$', '')
    local limit = Config.Security.maxMessageLength
    local boundary = utf8.offset(text, limit + 1)
    if boundary then text = text:sub(1, boundary - 1) end
    return text
end

local function containsBlockedWord(text)
    local lower = text:lower()
    for _, word in ipairs(Config.Security.blockedWords or {}) do
        local escaped = tostring(word):lower():gsub('([^%w])', '%%%1')
        if escaped ~= '' and lower:find('%f[%w]' .. escaped .. '%f[%W]') then return true end
    end
    return false
end

local function containsLink(text)
    local lower = text:lower()
    return lower:find('https?://') ~= nil
        or lower:find('www%.') ~= nil
        or lower:find('discord%.gg/') ~= nil
        or lower:find('discord%.com/invite/') ~= nil
end

local function sendSystem(source, message, kind)
    TriggerClientEvent('bgs_chat:client:system', source, message, kind or 'error')
end

local function payloadFor(source, channel, text)
    return {
        channel = channel.id,
        channelLabel = channel.prefix,
        color = channel.color,
        author = GetPlayerName(source) or ('Player %s'):format(source),
        source = source,
        text = text,
        timestamp = os.date('%H:%M'),
        system = false
    }
end

local function dispatchRecipients(source, channel)
    if channel.mode == 'global' or channel.mode == 'staff' then
        local recipients = {}
        for _, player in ipairs(GetPlayers()) do
            local target = tonumber(player)
            if channel.mode ~= 'staff' or hasChannelAccess(target, channel) then recipients[#recipients + 1] = target end
        end
        return recipients
    end

    if channel.mode == 'job' then
        local recipients = {}
        for _, player in ipairs(GetPlayers()) do
            local target = tonumber(player)
            if hasChannelAccess(target, channel) then recipients[#recipients + 1] = target end
        end
        return recipients
    end

    local sourcePed = GetPlayerPed(source)
    if sourcePed == 0 then return Config.LocalFallbackToGlobal and GetPlayers() or { source } end
    local sourceCoords = GetEntityCoords(sourcePed)
    local recipients = {}
    for _, player in ipairs(GetPlayers()) do
        local target = tonumber(player)
        local targetPed = GetPlayerPed(target)
        if targetPed ~= 0 then
            local targetCoords = GetEntityCoords(targetPed)
            if #(sourceCoords - targetCoords) <= Config.LocalDistance then recipients[#recipients + 1] = target end
        end
    end
    return recipients
end

local function logMessage(source, channel, text)
    if not Config.DiscordLog.enabled or Config.DiscordLog.webhook == '' then return end
    local data = {
        username = Config.DiscordLog.username,
        embeds = {{
            title = ('BGS Chat • %s'):format(channel.label),
            description = ('**%s** (`%s`)\n%s'):format(GetPlayerName(source) or 'Unknown', source, text),
            color = Config.DiscordLog.color,
            timestamp = os.date('!%Y-%m-%dT%H:%M:%SZ')
        }}
    }
    PerformHttpRequest(Config.DiscordLog.webhook, function() end, 'POST', json.encode(data), { ['Content-Type'] = 'application/json' })
end

local function processMessage(source, channelId, rawText)
    if source <= 0 then return end
    local channel = channelLookup[tostring(channelId or Config.DefaultChannel)]
    if not hasChannelAccess(source, channel) then
        sendSystem(source, channel and channel.mode == 'job' and Config.Messages.jobUnavailable or Config.Messages.channelDenied)
        return
    end

    local text = cleanText(rawText)
    if text == '' then return sendSystem(source, Config.Messages.empty) end

    local bypass = IsPlayerAceAllowed(source, Config.Security.bypassAce)
    local now = GetGameTimer()
    if not bypass and lastMessageAt[source] and now - lastMessageAt[source] < Config.Security.cooldownMilliseconds then
        return sendSystem(source, Config.Messages.rateLimited)
    end
    if not bypass and containsBlockedWord(text) then return sendSystem(source, Config.Messages.blocked) end
    if not bypass and not Config.Security.allowLinks and containsLink(text) then return sendSystem(source, Config.Messages.linksBlocked) end

    TriggerEvent('chatMessage', source, GetPlayerName(source), text)
    if WasEventCanceled() then return end

    lastMessageAt[source] = now
    local payload = payloadFor(source, channel, text)
    for _, target in ipairs(dispatchRecipients(source, channel)) do
        TriggerClientEvent('bgs_chat:client:message', tonumber(target), payload)
    end
    logMessage(source, channel, text)
end

RegisterNetEvent('bgs_chat:server:requestBootstrap', function()
    TriggerClientEvent('bgs_chat:client:bootstrap', source, availableChannels(source))
end)

RegisterNetEvent('bgs_chat:server:sendMessage', function(channel, text)
    processMessage(source, channel, text)
end)

RegisterNetEvent('_chat:messageEntered', function(_, _, message, mode)
    processMessage(source, mode or Config.DefaultChannel, message)
end)

for _, configuredChannel in ipairs(Config.Channels) do
    if configuredChannel.command and configuredChannel.command ~= '' then
        local channelId = configuredChannel.id
        RegisterCommand(configuredChannel.command, function(source, args)
            processMessage(source, channelId, table.concat(args, ' '))
        end, false)
    end
end

AddEventHandler('playerDropped', function()
    lastMessageAt[source] = nil
end)

exports('sendMessage', function(target, message)
    TriggerClientEvent('chat:addMessage', target, message)
end)
exports('broadcast', function(message)
    TriggerClientEvent('chat:addMessage', -1, message)
end)
