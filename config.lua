Config = {}

-- Framework is only used to identify jobs and duty status for restricted channels.
-- Supported values: 'auto', 'qb', 'qbox', 'esx', 'standalone'.
Config.Framework = 'auto'

Config.OpenKey = 'T'
Config.DisableNativeChat = true -- Prevent GTA's bottom-right [ALL] chat from also opening.
Config.DefaultChannel = 'local'
Config.LocalDistance = 20.0
Config.LocalFallbackToGlobal = false

Config.Appearance = {
    position = 'top-left', -- top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    width = 28,           -- viewport width percentage
    height = 34,          -- viewport height percentage
    accent = '#249EFF',
    showTimestamps = true,
    showPlayerIds = true,
    fadeAfter = 9000,
    historyRetention = 900000, -- 15 minutes; use 0 to retain messages until the history limit is reached.
    maxVisibleMessages = 6,
    historyLimit = 6, -- When message seven arrives, the oldest message is permanently removed.
    compactByDefault = false
}

Config.Security = {
    maxMessageLength = 280,
    cooldownMilliseconds = 1000,
    allowLinks = false,
    bypassAce = 'bgs_chat.bypass',
    blockedWords = {
        -- 'exampleword'
    }
}

Config.Channels = {
    {
        id = 'local',
        label = 'Local',
        prefix = 'LOCAL',
        color = '#69B9FF',
        command = 'local',
        enabled = true,
        mode = 'local'
    },
    {
        id = 'global',
        label = 'Global',
        prefix = 'GLOBAL',
        color = '#A9B6C4',
        command = 'global',
        enabled = true,
        mode = 'global'
    },
    {
        id = 'ooc',
        label = 'OOC',
        prefix = 'OOC',
        color = '#B997FF',
        command = 'ooc',
        enabled = true,
        mode = 'global'
    },
    {
        id = 'admin',
        label = 'Admin',
        prefix = 'ADMIN',
        color = '#39FF88',
        command = 'adminchat',
        enabled = true,
        mode = 'staff',
        ace = 'bgs_chat.admin'
    },
    {
        id = 'police',
        label = 'Police',
        prefix = 'POLICE',
        color = '#3B82F6',
        command = 'policechat',
        enabled = true,
        mode = 'job',
        requiredJobs = { 'police' },
        requireDuty = true
    },
    {
        id = 'ems',
        label = 'EMS',
        prefix = 'EMS',
        color = '#FF4D5E',
        command = 'emschat',
        enabled = true,
        mode = 'job',
        requiredJobs = { 'ambulance', 'ems' },
        requireDuty = true
    },
    {
        id = 'mechanic',
        label = 'Mechanic',
        prefix = 'MECHANIC',
        color = '#F5A623',
        command = 'mechanicchat',
        enabled = true,
        mode = 'job',
        requiredJobs = { 'mechanic', 'mechanic2', 'mechanic3' },
        requireDuty = true
    }
}

Config.Emoji = {
    enabled = true,
    rememberRecent = true,
    recentLimit = 18
}

Config.Commands = {
    toggle = 'togglechat',
    compact = 'chatcompact',
    clear = 'clearchat'
}

Config.DiscordLog = {
    enabled = false,
    webhook = '',
    username = 'BGS Chat',
    color = 2408191
}

Config.Messages = {
    hidden = 'Chat is now hidden. Use /%s to show it again.',
    shown = 'Chat is now visible.',
    compactOn = 'Compact chat enabled.',
    compactOff = 'Compact chat disabled.',
    rateLimited = 'You are sending messages too quickly.',
    blocked = 'That message is not allowed.',
    linksBlocked = 'Links are not allowed in chat.',
    channelDenied = 'You cannot use that chat channel.',
    jobUnavailable = 'You must have the required job and be on duty to use that channel.',
    empty = 'Your message cannot be empty.'
}
