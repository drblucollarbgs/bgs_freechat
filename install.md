# BGS Chat

**BGS Chat** is a free, open-source FiveM chat replacement by Blu3Forge Gaming Studio. It keeps the familiar FiveM chat events developers already use while adding a modern NUI, secure server-routed channels, command suggestions, command history, compact mode, and a complete native emoji picker.

The compact top composer remains subtly visible while idle so players always know chat is available. Pressing the configured chat key brings it into full view, with new messages stacking downward beneath it.

## Features

- Standalone drop-in replacement for the stock FiveM chat.
- QBCore, Qbox, ESX, and standalone support.
- Local, global, OOC, Admin, Police, EMS, and Mechanic channels.
- Job and duty restrictions for emergency-service and mechanic channels, plus ACE permission for Admin chat.
- A custom color-coded channel menu that shows every configured channel and clearly marks unavailable ones as locked.
- Server-side proximity routing, permissions, length checks, cooldowns, word filters, and link blocking.
- Existing `chat:addMessage`, suggestion, clear, and legacy `_chat:messageEntered` event compatibility.
- Emoji picker with categories, search, recent history, and insertion at the current typing cursor.
- Command autocomplete, parameter hints, Tab completion, and arrow-key command history.
- Configurable placement, size, accent color, timestamps, player IDs, fade time, history, and visible-message limit.
- `/togglechat`, `/chatcompact`, and `/clearchat` controls.
- Optional Discord webhook logging.
- No remote fonts, CDNs, or paid dependencies.
- Suppresses GTA's native bottom-right multiplayer chat so the configured key opens only BGS Chat.

## Requirements

- A current FiveM server artifact.
- OneSync is strongly recommended and is required for accurate server-side local proximity chat.
- A framework is optional. It is only used for the job channel.

## Quick installation

1. Copy the `bgs_chat` folder into your server's resources directory.
2. Remove or comment out the stock `ensure chat` line. If the stock chat is started by a collection, place `stop chat` before `ensure bgs_chat`.
3. Add:

```cfg
ensure bgs_chat
```

4. Restart the server. Do not run the stock `chat` resource and BGS Chat at the same time.

See [INSTALL.md](INSTALL.md) for permissions, framework selection, and testing.

Asset creators should also read [ESCROW.md](ESCROW.md) before uploading the release to the Cfx Portal.

## Configuration

Everything server owners normally change is in `config.lua`:

- `Config.Framework`: `auto`, `qb`, `qbox`, `esx`, or `standalone`.
- `Config.OpenKey`: default chat key.
- `Config.DisableNativeChat`: prevents GTA's native `[ALL]` chat input from opening alongside BGS Chat.
- `Config.DefaultChannel`: initially selected channel.
- `Config.LocalDistance`: local-chat radius in game units.
- `Config.Appearance`: position, size, colors, timestamps, IDs, fade behavior, and history.
- `Config.Appearance.historyRetention`: how long messages remain in local history before permanent removal; defaults to 15 minutes and can be set to `0` to disable timed removal.
- `Config.Appearance.historyLimit`: maximum retained messages; defaults to the newest six, with the oldest removed when a seventh arrives.
- `Config.Security`: maximum length, cooldown, link policy, bypass ACE, and blocked words.
- `Config.Channels`: add, remove, recolor, rename, disable, or permission-lock channels.
- `Config.Emoji`: enable the picker and configure recent history.
- `Config.DiscordLog`: optional webhook logging.

### Supported positions

```text
top-left      top-center      top-right
bottom-left   bottom-center   bottom-right
```

## Commands

| Command | Purpose |
| --- | --- |
| `/local <message>` | Send proximity chat. |
| `/global <message>` | Send global chat. |
| `/ooc <message>` | Send global out-of-character chat. |
| `/adminchat <message>` | Send to members with `bgs_chat.admin`. |
| `/policechat <message>` | Send to on-duty players with the configured Police job. |
| `/emschat <message>` | Send to on-duty players with a configured EMS job. |
| `/mechanicchat <message>` | Send to on-duty players with a configured Mechanic job. |
| `/togglechat` | Hide or show chat locally. |
| `/chatcompact` | Toggle compact presentation locally. |
| `/clearchat` | Clear local chat history. |

## Standard FiveM event compatibility

Existing scripts can keep using:

```lua
TriggerClientEvent('chat:addMessage', source, {
    color = { 36, 158, 255 },
    args = { 'SYSTEM', 'Welcome to the server.' }
})
```

Suggestions continue to work:

```lua
TriggerClientEvent('chat:addSuggestion', source, '/example', 'Example command', {
    { name = 'value', help = 'Example value' }
})
```

### Client exports

```lua
exports.bgs_chat:addMessage(message)
exports.bgs_chat:addSuggestion(name, help, params)
exports.bgs_chat:removeSuggestion(name)
exports.bgs_chat:clear()
exports.bgs_chat:open('optional starting text')
exports.bgs_chat:close()
exports.bgs_chat:setVisible(true)
```

### Server exports

```lua
exports.bgs_chat:sendMessage(targetSource, message)
exports.bgs_chat:broadcast(message)
```

## Adding channels

Channels are defined in `Config.Channels`. Supported routing modes are:

- `local`: players within `Config.LocalDistance`.
- `global`: every connected player.
- `job`: players with one of that channel's configured `requiredJobs`, optionally restricted by `requireDuty`.
- `staff`: connected players who pass the channel's ACE permission.

Example ACE-restricted channel:

```lua
{
    id = 'management',
    label = 'Management',
    prefix = 'MGMT',
    color = '#FFB454',
    enabled = true,
    mode = 'staff',
    ace = 'bgs_chat.management'
}
```

Add the corresponding ACE in `server.cfg`.

The included Admin channel uses:

```cfg
add_ace group.admin bgs_chat.admin allow
```

Default restricted job names are configured directly on the Police, EMS, and Mechanic channel entries. Change their `requiredJobs` lists to match the job names used by your server.

## Developer notes

- User text is rendered with `textContent`, never injected as HTML.
- Channel membership, proximity, job identity, permissions, filters, and cooldowns are checked by the server.
- The resource intentionally does not render arbitrary legacy HTML templates. Standard argument-based messages remain supported without exposing unsafe HTML.
- Resources that call `exports.chat:*` by resource name must be changed to event-based messages or the `bgs_chat` exports. Standard `chat:*` events require no changes.
- The manifest is Asset Escrow ready: client/server Lua is protected after Portal processing, while `config.lua` remains editable. FiveM does not currently support encrypting NUI files.

## Support

For updates and support, join the Blu3Forge Gaming Studio Discord listed with the store release.

**Blu3Forge Gaming Studio — Forged for FiveM.**
