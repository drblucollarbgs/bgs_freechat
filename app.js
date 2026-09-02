(() => {
    'use strict';

    const resourceName = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'bgs_chat';
    const chat = document.getElementById('chat');
    const messagesEl = document.getElementById('messages');
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const characterCount = document.getElementById('characterCount');
    const channelSelect = document.getElementById('channelSelect');
    const channelSelectWrap = document.getElementById('channelSelectWrap');
    const channelButton = document.getElementById('channelButton');
    const channelButtonLabel = document.getElementById('channelButtonLabel');
    const channelMenu = document.getElementById('channelMenu');
    const channelIndicator = document.getElementById('channelIndicator');
    const emojiButton = document.getElementById('emojiButton');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiClose = document.getElementById('emojiClose');
    const emojiSearch = document.getElementById('emojiSearch');
    const emojiGrid = document.getElementById('emojiGrid');
    const emojiTitle = document.getElementById('emojiTitle');
    const emojiCategories = document.getElementById('emojiCategories');
    const suggestionsEl = document.getElementById('suggestions');

    const state = {
        open: false,
        visible: true,
        compact: false,
        settings: {
            fadeAfter: 9000,
            historyRetention: 900000,
            historyLimit: 6,
            maxVisibleMessages: 6,
            showTimestamps: true,
            showPlayerIds: true,
            emoji: { enabled: true, rememberRecent: true, recentLimit: 18 },
            channels: [],
            defaultChannel: 'local'
        },
        suggestions: new Map(),
        filteredSuggestions: [],
        selectedSuggestion: 0,
        commandHistory: [],
        historyIndex: -1,
        selectedEmojiCategory: 'recent'
    };

    const emojiData = {
        smileys: {
            icon: '😊', label: 'Smileys', items: [
                ['😀','grinning'],['😃','happy'],['😄','smile'],['😁','grin'],['😆','laugh'],['😅','sweat smile'],['😂','joy'],['🤣','rolling laugh'],
                ['😊','blush'],['🙂','slight smile'],['🙃','upside down'],['😉','wink'],['😌','relieved'],['😍','heart eyes'],['🥰','love'],['😘','kiss'],
                ['😎','cool'],['🤓','nerd'],['🧐','monocle'],['🤔','thinking'],['🤨','raised eyebrow'],['😐','neutral'],['😑','expressionless'],['🙄','eye roll'],
                ['😏','smirk'],['😣','persevere'],['😥','sad'],['😮','surprised'],['🤐','zipper'],['😯','hushed'],['😲','astonished'],['😴','sleeping'],
                ['🤤','drool'],['😪','sleepy'],['😵','dizzy'],['🤯','mind blown'],['🥳','party'],['😤','triumph'],['😡','angry'],['🤬','swearing'],
                ['😱','scream'],['😨','fearful'],['😰','anxious'],['😢','cry'],['😭','sob'],['🤫','quiet'],['🤭','giggle'],['🫡','salute']
            ]
        },
        people: {
            icon: '👋', label: 'People', items: [
                ['👋','wave'],['🤚','raised hand'],['🖐️','hand'],['✋','stop'],['👌','okay'],['🤌','pinched'],['🤏','small'],['✌️','peace'],
                ['🤞','fingers crossed'],['🤟','love you'],['🤘','rock'],['🤙','call me'],['👈','left'],['👉','right'],['👆','up'],['👇','down'],
                ['👍','thumbs up'],['👎','thumbs down'],['✊','fist'],['👊','punch'],['🤛','left fist'],['🤜','right fist'],['👏','clap'],['🙌','celebrate'],
                ['🫶','heart hands'],['🤝','handshake'],['🙏','please'],['💪','strong'],['🫵','you'],['👀','eyes'],['🧠','brain'],['🗣️','speaking']
            ]
        },
        reactions: {
            icon: '❤️', label: 'Reactions', items: [
                ['❤️','red heart'],['🧡','orange heart'],['💛','yellow heart'],['💚','green heart'],['💙','blue heart'],['💜','purple heart'],['🖤','black heart'],['🤍','white heart'],
                ['💔','broken heart'],['❤️‍🔥','heart fire'],['💕','two hearts'],['💯','hundred'],['💢','anger'],['💥','boom'],['💫','dizzy'],['💦','sweat'],
                ['🔥','fire'],['✨','sparkles'],['🎉','party'],['🎊','confetti'],['⭐','star'],['⚡','lightning'],['✅','check'],['❌','cross'],
                ['❓','question'],['❗','exclamation'],['⚠️','warning'],['💤','sleep'],['💀','skull'],['☠️','danger'],['💩','poop'],['🤡','clown']
            ]
        },
        activities: {
            icon: '🎮', label: 'Activities', items: [
                ['🎮','game'],['🕹️','joystick'],['🎲','dice'],['🎯','target'],['🏆','trophy'],['🥇','gold medal'],['⚽','soccer'],['🏀','basketball'],
                ['🏈','football'],['⚾','baseball'],['🎳','bowling'],['🎣','fishing'],['🏎️','race car'],['🏍️','motorcycle'],['🚲','bike'],['🏋️','lifting'],
                ['🎸','guitar'],['🎧','headphones'],['🎤','microphone'],['🎬','movie'],['📸','camera'],['🎨','art'],['🎁','gift'],['🎂','cake']
            ]
        },
        travel: {
            icon: '🚘', label: 'Travel', items: [
                ['🚘','car'],['🚗','red car'],['🚓','police car'],['🚑','ambulance'],['🚒','fire truck'],['🚚','truck'],['🏍️','motorcycle'],['🚁','helicopter'],
                ['✈️','airplane'],['🚤','boat'],['⛽','fuel'],['🚦','traffic light'],['🗺️','map'],['📍','location'],['🏠','house'],['🏢','building'],
                ['🏦','bank'],['🏥','hospital'],['🚔','police'],['🌆','city'],['🌙','night'],['☀️','sun'],['🌧️','rain'],['❄️','snow']
            ]
        },
        objects: {
            icon: '🔧', label: 'Objects', items: [
                ['📱','phone'],['💻','computer'],['⌨️','keyboard'],['🔧','wrench'],['🔨','hammer'],['⚙️','gear'],['🧰','toolbox'],['🔑','key'],
                ['🔒','lock'],['🔓','unlock'],['💡','idea'],['🔦','flashlight'],['📦','box'],['💰','money'],['💵','cash'],['💳','card'],
                ['💎','diamond'],['📻','radio'],['📢','loudspeaker'],['📌','pin'],['📝','note'],['📋','clipboard'],['🛡️','shield'],['🔔','bell']
            ]
        },
        symbols: {
            icon: '🔣', label: 'Symbols', items: [
                ['✔️','check'],['✖️','x'],['➕','plus'],['➖','minus'],['➡️','right arrow'],['⬅️','left arrow'],['⬆️','up arrow'],['⬇️','down arrow'],
                ['🔴','red circle'],['🟠','orange circle'],['🟡','yellow circle'],['🟢','green circle'],['🔵','blue circle'],['🟣','purple circle'],['⚫','black circle'],['⚪','white circle'],
                ['1️⃣','one'],['2️⃣','two'],['3️⃣','three'],['4️⃣','four'],['5️⃣','five'],['6️⃣','six'],['7️⃣','seven'],['8️⃣','eight'],
                ['9️⃣','nine'],['0️⃣','zero'],['🆘','sos'],['🆗','ok'],['🆕','new'],['🔞','18'],['♻️','recycle'],['©️','copyright']
            ]
        }
    };

    const postNui = async (event, data = {}) => {
        if (typeof GetParentResourceName !== 'function') return { ok: true };
        try {
            const response = await fetch(`https://${resourceName}/${event}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(data)
            });
            return response.json();
        } catch (_) {
            return { ok: false };
        }
    };

    const hexToRgb = (hex) => {
        const value = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex.slice(1) : '249EFF';
        return `${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}`;
    };

    const configure = (settings = {}) => {
        state.settings = { ...state.settings, ...settings };
        state.compact = settings.compact === true;
        document.documentElement.style.setProperty('--accent', settings.accent || '#249EFF');
        document.documentElement.style.setProperty('--accent-rgb', hexToRgb(settings.accent));
        document.documentElement.style.setProperty('--chat-width', `${Number(settings.width) || 34}vw`);
        document.documentElement.style.setProperty('--chat-height', `${Number(settings.height) || 42}vh`);
        chat.className = `chat position-${settings.position || 'top-left'}${state.open ? ' open' : ''}${state.compact ? ' compact' : ''}${state.visible ? '' : ' hidden'}`;
        input.maxLength = Number(settings.maxMessageLength) || 280;
        emojiButton.hidden = settings.emoji && settings.emoji.enabled === false;
        rebuildChannels(settings.channels || []);
        renderEmojiCategories();
        updateCharacterCount();
    };

    const rebuildChannels = (channels) => {
        const previous = channelSelect.value || state.settings.defaultChannel;
        channelSelect.replaceChildren();
        channelMenu.replaceChildren();
        channels.forEach((channel) => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = String(channel.label).toUpperCase();
            option.dataset.color = channel.color;
            option.dataset.label = channel.label;
            option.dataset.allowed = channel.allowed === false ? 'false' : 'true';
            channelSelect.append(option);

            const menuItem = document.createElement('button');
            menuItem.type = 'button';
            menuItem.className = `channel-menu-item${channel.allowed === false ? ' locked' : ''}`;
            menuItem.disabled = channel.allowed === false;
            menuItem.style.setProperty('--channel-color', channel.color);
            menuItem.setAttribute('role', 'menuitem');

            const dot = document.createElement('span');
            dot.className = 'channel-menu-dot';
            const label = document.createElement('span');
            label.className = 'channel-menu-label';
            label.textContent = String(channel.label).toUpperCase();
            menuItem.append(dot, label);

            if (channel.allowed === false) {
                const lock = document.createElement('span');
                lock.className = 'channel-lock';
                lock.textContent = 'LOCKED';
                menuItem.append(lock);
            } else {
                menuItem.addEventListener('click', () => selectChannel(channel.id));
            }
            channelMenu.append(menuItem);
        });

        const isAllowed = (id) => channels.some((channel) => channel.id === id && channel.allowed !== false);
        const desired = isAllowed(previous)
            ? previous
            : isAllowed(state.settings.defaultChannel)
                ? state.settings.defaultChannel
                : channels.find((channel) => channel.allowed !== false)?.id;
        if (desired) channelSelect.value = desired;
        updateChannelIndicator();
    };

    const updateChannelIndicator = () => {
        const selected = channelSelect.selectedOptions[0];
        const color = selected?.dataset.color || 'var(--accent)';
        channelIndicator.style.background = color;
        channelIndicator.style.boxShadow = `0 0 9px ${color}`;
        channelButton.style.color = color;
        channelButtonLabel.textContent = String(selected?.dataset.label || selected?.textContent || 'LOCAL').toUpperCase();
        [...channelMenu.children].forEach((item, index) => item.classList.toggle('selected', index === channelSelect.selectedIndex));
    };

    const closeChannelMenu = () => {
        channelMenu.hidden = true;
        channelButton.setAttribute('aria-expanded', 'false');
    };

    const selectChannel = (channelId) => {
        const option = [...channelSelect.options].find((item) => item.value === channelId && item.dataset.allowed !== 'false');
        if (!option) return;
        channelSelect.value = channelId;
        updateChannelIndicator();
        closeChannelMenu();
        input.focus();
    };

    const addMessage = (message = {}) => {
        const element = document.createElement('article');
        element.className = 'message entering';
        element.style.setProperty('--message-color', /^#[0-9a-f]{6}$/i.test(message.color || '') ? message.color : '#249EFF');

        const accent = document.createElement('div');
        accent.className = 'message-accent';
        const content = document.createElement('div');
        content.className = 'message-content';
        const meta = document.createElement('div');
        meta.className = 'message-meta';

        const badge = document.createElement('span');
        badge.className = 'channel-badge';
        badge.textContent = String(message.channelLabel || message.channel || 'CHAT').toUpperCase();
        meta.append(badge);

        if (message.author) {
            const author = document.createElement('span');
            author.className = 'message-author';
            author.textContent = String(message.author);
            meta.append(author);
        }

        if (state.settings.showPlayerIds && message.source !== undefined && message.source !== null) {
            const id = document.createElement('span');
            id.className = 'message-id';
            id.textContent = `#${message.source}`;
            meta.append(id);
        }

        if (state.settings.showTimestamps) {
            const time = document.createElement('span');
            time.className = 'message-time';
            time.textContent = message.timestamp || '';
            meta.append(time);
        }

        const text = document.createElement('div');
        text.className = 'message-text';
        text.textContent = String(message.text || '');
        content.append(meta, text);
        element.append(accent, content);
        messagesEl.append(element);

        requestAnimationFrame(() => element.classList.remove('entering'));
        window.setTimeout(() => element.classList.add('stale'), Number(state.settings.fadeAfter) || 9000);
        const retention = Number(state.settings.historyRetention);
        if (retention > 0) window.setTimeout(() => element.remove(), Math.max(1000, retention));

        while (messagesEl.children.length > Number(state.settings.historyLimit || 100)) messagesEl.firstElementChild?.remove();
        const visibleLimit = Math.max(1, Number(state.settings.maxVisibleMessages || 8));
        [...messagesEl.children].slice(0, -visibleLimit).forEach((item) => item.classList.add('stale'));
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const openChat = (data = {}) => {
        if (!state.visible) return;
        state.open = true;
        state.historyIndex = -1;
        chat.classList.add('open');
        [...messagesEl.children].forEach((item) => item.classList.remove('stale'));
        input.value = data.initialText || '';
        updateCharacterCount();
        updateSuggestions();
        window.setTimeout(() => input.focus(), 0);
    };

    const closeChat = (notify = false) => {
        state.open = false;
        chat.classList.remove('open');
        closeEmojiPicker();
        closeChannelMenu();
        suggestionsEl.hidden = true;
        window.setTimeout(() => {
            if (!state.open) [...messagesEl.children].forEach((item) => item.classList.add('stale'));
        }, Number(state.settings.fadeAfter) || 9000);
        if (notify) postNui('close');
    };

    const submit = () => {
        const text = input.value.trim();
        if (!text) return;
        if (state.commandHistory[0] !== text) state.commandHistory.unshift(text);
        state.commandHistory = state.commandHistory.slice(0, 30);
        postNui('submit', { text, channel: channelSelect.value || state.settings.defaultChannel });
        input.value = '';
        closeChat(false);
    };

    const updateCharacterCount = () => {
        characterCount.textContent = `${input.value.length}/${input.maxLength}`;
        characterCount.style.color = input.value.length >= input.maxLength * 0.9 ? '#ff9f66' : '';
        input.style.height = '40px';
        input.style.height = `${Math.min(78, Math.max(40, input.scrollHeight))}px`;
    };

    const setSuggestions = (items) => {
        state.suggestions.clear();
        const values = Array.isArray(items) ? items : Object.values(items || {});
        values.forEach((item) => item?.name && state.suggestions.set(item.name, item));
        updateSuggestions();
    };

    const updateSuggestions = () => {
        const value = input.value.trimStart();
        if (!value.startsWith('/') || value.includes(' ')) {
            suggestionsEl.hidden = true;
            state.filteredSuggestions = [];
            return;
        }

        const query = value.toLowerCase();
        state.filteredSuggestions = [...state.suggestions.values()]
            .filter((item) => String(item.name).toLowerCase().startsWith(query))
            .slice(0, 7);
        state.selectedSuggestion = Math.min(state.selectedSuggestion, Math.max(0, state.filteredSuggestions.length - 1));
        renderSuggestions();
    };

    const renderSuggestions = () => {
        suggestionsEl.replaceChildren();
        if (!state.filteredSuggestions.length) {
            suggestionsEl.hidden = true;
            return;
        }
        state.filteredSuggestions.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = `suggestion${index === state.selectedSuggestion ? ' active' : ''}`;
            const name = document.createElement('span');
            name.className = 'suggestion-name';
            name.textContent = item.name;
            const help = document.createElement('span');
            help.className = 'suggestion-help';
            help.textContent = item.help || '';
            row.append(name, help);
            if (Array.isArray(item.params) && item.params.length) {
                const params = document.createElement('div');
                params.className = 'suggestion-params';
                params.textContent = item.params.map((param) => `<${param.name}> ${param.help || ''}`).join('  •  ');
                row.append(params);
            }
            row.addEventListener('mousedown', (event) => {
                event.preventDefault();
                applySuggestion(item);
            });
            suggestionsEl.append(row);
        });
        suggestionsEl.hidden = false;
    };

    const applySuggestion = (item = state.filteredSuggestions[state.selectedSuggestion]) => {
        if (!item) return;
        input.value = `${item.name} `;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        updateCharacterCount();
        updateSuggestions();
    };

    const getRecentEmojis = () => {
        if (!state.settings.emoji?.rememberRecent) return [];
        try { return JSON.parse(localStorage.getItem('bgs_chat_recent_emojis') || '[]'); }
        catch (_) { return []; }
    };

    const rememberEmoji = (emoji) => {
        if (!state.settings.emoji?.rememberRecent) return;
        const limit = Number(state.settings.emoji.recentLimit) || 18;
        const recent = getRecentEmojis().filter((item) => item !== emoji);
        recent.unshift(emoji);
        localStorage.setItem('bgs_chat_recent_emojis', JSON.stringify(recent.slice(0, limit)));
    };

    const renderEmojiCategories = () => {
        emojiCategories.replaceChildren();
        const categories = [{ id: 'recent', icon: '🕘', label: 'Recent' }, ...Object.entries(emojiData).map(([id, data]) => ({ id, ...data }))];
        categories.forEach((category) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `emoji-category${state.selectedEmojiCategory === category.id ? ' active' : ''}`;
            button.textContent = category.icon;
            button.title = category.label;
            button.addEventListener('click', () => {
                state.selectedEmojiCategory = category.id;
                emojiSearch.value = '';
                renderEmojiCategories();
                renderEmojis();
            });
            emojiCategories.append(button);
        });
        renderEmojis();
    };

    const allEmojis = () => Object.values(emojiData).flatMap((category) => category.items);

    const selectedEmojiItems = () => {
        const query = emojiSearch.value.trim().toLowerCase();
        if (query) return allEmojis().filter(([, name]) => name.includes(query));
        if (state.selectedEmojiCategory === 'recent') {
            const recent = getRecentEmojis();
            return recent.length ? recent.map((emoji) => [emoji, 'recent']) : emojiData.smileys.items.slice(0, 18);
        }
        return emojiData[state.selectedEmojiCategory]?.items || [];
    };

    const renderEmojis = () => {
        const query = emojiSearch.value.trim();
        const label = query ? 'Search results' : state.selectedEmojiCategory === 'recent' ? 'Frequently used' : emojiData[state.selectedEmojiCategory]?.label;
        emojiTitle.textContent = label || 'Emojis';
        emojiGrid.replaceChildren();
        selectedEmojiItems().forEach(([emoji, name]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'emoji-item';
            button.textContent = emoji;
            button.title = name;
            button.addEventListener('click', () => insertEmoji(emoji));
            emojiGrid.append(button);
        });
    };

    const insertEmoji = (emoji) => {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        const before = input.value.slice(0, start);
        const after = input.value.slice(end);
        const spacerBefore = before && !before.endsWith(' ') ? ' ' : '';
        const spacerAfter = after && !after.startsWith(' ') ? ' ' : '';
        const insertion = `${spacerBefore}${emoji}${spacerAfter}`;
        input.value = `${before}${insertion}${after}`.slice(0, input.maxLength);
        const caret = Math.min(input.value.length, start + insertion.length);
        input.focus();
        input.setSelectionRange(caret, caret);
        rememberEmoji(emoji);
        updateCharacterCount();
        renderEmojiCategories();
    };

    const toggleEmojiPicker = () => {
        if (state.settings.emoji?.enabled === false) return;
        closeChannelMenu();
        emojiPicker.hidden = !emojiPicker.hidden;
        suggestionsEl.hidden = true;
        if (!emojiPicker.hidden) {
            renderEmojiCategories();
            emojiSearch.value = '';
        } else input.focus();
    };

    const closeEmojiPicker = () => {
        emojiPicker.hidden = true;
        emojiSearch.value = '';
    };

    input.addEventListener('input', () => {
        updateCharacterCount();
        updateSuggestions();
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
            return;
        }
        if (event.key === 'Tab' && state.filteredSuggestions.length) {
            event.preventDefault();
            applySuggestion();
            return;
        }
        if (event.key === 'ArrowDown' && state.filteredSuggestions.length) {
            event.preventDefault();
            state.selectedSuggestion = (state.selectedSuggestion + 1) % state.filteredSuggestions.length;
            renderSuggestions();
            return;
        }
        if (event.key === 'ArrowUp' && state.filteredSuggestions.length) {
            event.preventDefault();
            state.selectedSuggestion = (state.selectedSuggestion - 1 + state.filteredSuggestions.length) % state.filteredSuggestions.length;
            renderSuggestions();
            return;
        }
        if (event.key === 'ArrowUp' && !input.value) {
            event.preventDefault();
            state.historyIndex = Math.min(state.commandHistory.length - 1, state.historyIndex + 1);
            input.value = state.commandHistory[state.historyIndex] || '';
            updateCharacterCount();
            return;
        }
        if (event.key === 'ArrowDown' && state.historyIndex >= 0) {
            event.preventDefault();
            state.historyIndex = Math.max(-1, state.historyIndex - 1);
            input.value = state.historyIndex >= 0 ? state.commandHistory[state.historyIndex] : '';
            updateCharacterCount();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (!channelMenu.hidden) {
                closeChannelMenu();
                input.focus();
            } else if (!emojiPicker.hidden) {
                closeEmojiPicker();
                input.focus();
            } else if (state.open) closeChat(true);
        }
    });

    document.addEventListener('mousedown', (event) => {
        if (!emojiPicker.hidden && !emojiPicker.contains(event.target) && !emojiButton.contains(event.target)) closeEmojiPicker();
        if (!channelMenu.hidden && !channelSelectWrap.contains(event.target)) closeChannelMenu();
    });

    sendButton.addEventListener('click', submit);
    emojiButton.addEventListener('click', toggleEmojiPicker);
    emojiClose.addEventListener('click', () => { closeEmojiPicker(); input.focus(); });
    emojiSearch.addEventListener('input', renderEmojis);
    channelButton.addEventListener('click', () => {
        closeEmojiPicker();
        suggestionsEl.hidden = true;
        channelMenu.hidden = !channelMenu.hidden;
        channelButton.setAttribute('aria-expanded', String(!channelMenu.hidden));
    });

    window.addEventListener('message', ({ data }) => {
        const action = data?.action;
        const payload = data?.payload;
        if (action === 'configure') configure(payload);
        else if (action === 'chat:open') openChat(payload);
        else if (action === 'chat:close') closeChat(false);
        else if (action === 'chat:visible') {
            state.visible = payload?.visible !== false;
            chat.classList.toggle('hidden', !state.visible);
        }
        else if (action === 'chat:compact') {
            state.compact = payload?.compact === true;
            chat.classList.toggle('compact', state.compact);
        }
        else if (action === 'message:add') addMessage(payload);
        else if (action === 'messages:clear') messagesEl.replaceChildren();
        else if (action === 'suggestions:set') setSuggestions(payload);
        else if (action === 'suggestion:add' && payload?.name) {
            state.suggestions.set(payload.name, payload);
            updateSuggestions();
        }
        else if (action === 'suggestion:remove' && payload?.name) {
            state.suggestions.delete(payload.name);
            updateSuggestions();
        }
    });

    postNui('ready');

    if (new URLSearchParams(window.location.search).has('preview')) {
        configure({
            position: 'top-left', width: 28, height: 34, accent: '#249EFF', showTimestamps: true, showPlayerIds: true,
            fadeAfter: 900000, maxVisibleMessages: 6, historyLimit: 6,
            emoji: { enabled: true, rememberRecent: true, recentLimit: 18 },
            channels: [
                { id: 'local', label: 'Local', color: '#69B9FF' },
                { id: 'global', label: 'Global', color: '#A9B6C4' },
                { id: 'ooc', label: 'OOC', color: '#B997FF' },
                { id: 'admin', label: 'Admin', color: '#39FF88' },
                { id: 'police', label: 'Police', color: '#3B82F6' },
                { id: 'ems', label: 'EMS', color: '#FF4D5E' },
                { id: 'mechanic', label: 'Mechanic', color: '#F5A623' }
            ], defaultChannel: 'local'
        });
        addMessage({ channelLabel: 'LOCAL', color: '#69B9FF', author: 'DrBlu3Collar', source: 12, text: 'Anyone want to go boosting tonight? 🚘💰', timestamp: '21:42' });
        addMessage({ channelLabel: 'JOB', color: '#55D6BE', author: 'Avery', source: 7, text: 'The work truck is loaded and ready at the shop.', timestamp: '21:43' });
        addMessage({ channelLabel: 'OOC', color: '#B997FF', author: 'Jason', source: 24, text: 'That UI is looking clean! 🔥', timestamp: '21:44' });
        setSuggestions([
            { name: '/local', help: 'Send a proximity message', params: [{ name: 'message', help: 'Message text' }] },
            { name: '/togglechat', help: 'Show or hide BGS Chat', params: [] }
        ]);
        openChat({ initialText: 'This is going to be ' });
        window.setTimeout(() => {
            emojiPicker.hidden = false;
            renderEmojiCategories();
        }, 250);
    }
})();
