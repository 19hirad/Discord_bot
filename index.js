const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Requires Message Content Intent
        GatewayIntentBits.GuildMembers   // Requires Server Members Intent
    ]
});

// Bot Ready Event
client.once('ready', () => {
    console.log(`✅ Bot ist online als ${client.user.tag}!`);
    client.user.setActivity('Befehle ausführen', { type: ActivityType.Watching });
});

// Slash Commands registrieren
client.on('ready', async () => {
    const commands = [
        // Clear Command
        new SlashCommandBuilder()
            .setName('clear')
            .setDescription('Löscht Nachrichten')
            .addIntegerOption(option =>
                option.setName('anzahl')
                    .setDescription('Anzahl der zu löschenden Nachrichten (1-100)')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(100))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

        // Kick Command
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('Kickt einen User')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User zum kicken')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('grund')
                    .setDescription('Grund für den Kick')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

        // Mute Command
        new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Mutet einen User')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User zum muten')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('minuten')
                    .setDescription('Mute-Dauer in Minuten')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(10080))
            .addStringOption(option =>
                option.setName('grund')
                    .setDescription('Grund für den Mute')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

        // Ban Command
        new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Bannt einen User')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User zum bannen')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('grund')
                    .setDescription('Grund für den Ban')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

        // Serverinfo Command
        new SlashCommandBuilder()
            .setName('serverinfo')
            .setDescription('Zeigt Server-Informationen'),

        // Userinfo Command
        new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Zeigt User-Informationen')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User für Infos')
                    .setRequired(false)),

        // Avatar Command
        new SlashCommandBuilder()
            .setName('avatar')
            .setDescription('Zeigt Avatar eines Users')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User für Avatar')
                    .setRequired(false)),

        // Ping Command
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Zeigt Bot-Latenz'),

        // Würfel Command
        new SlashCommandBuilder()
            .setName('würfel')
            .setDescription('Würfle mit verschiedenen Würfeln')
            .addIntegerOption(option =>
                option.setName('seiten')
                    .setDescription('Anzahl der Würfelseiten (Standard: 6)')
                    .setRequired(false)
                    .setMinValue(2)
                    .setMaxValue(1000)),

        // Münzwurf Command
        new SlashCommandBuilder()
            .setName('münze')
            .setDescription('Wirf eine Münze'),

        // Casino Command
        new SlashCommandBuilder()
            .setName('casino')
            .setDescription('Spiele Casino! 🎰')
            .addIntegerOption(option =>
                option.setName('einsatz')
                    .setDescription('Dein Einsatz (1-1000)')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(1000)),

        // Glücksrad Command
        new SlashCommandBuilder()
            .setName('glücksrad')
            .setDescription('Drehe das Glücksrad! 🎡'),

        // 8Ball Command
        new SlashCommandBuilder()
            .setName('8ball')
            .setDescription('Stelle der magischen 8-Ball eine Frage')
            .addStringOption(option =>
                option.setName('frage')
                    .setDescription('Deine Frage')
                    .setRequired(true))
    ];

    try {
        console.log('Registriere Slash Commands...');
        await client.application.commands.set(commands);
        console.log('✅ Slash Commands erfolgreich registriert!');
    } catch (error) {
        console.error('❌ Fehler beim Registrieren der Commands:', error);
    }
});

// Interaction Handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'clear':
                await handleClear(interaction);
                break;
            case 'kick':
                await handleKick(interaction);
                break;
            case 'mute':
                await handleMute(interaction);
                break;
            case 'ban':
                await handleBan(interaction);
                break;
            case 'serverinfo':
                await handleServerInfo(interaction);
                break;
            case 'userinfo':
                await handleUserInfo(interaction);
                break;
            case 'avatar':
                await handleAvatar(interaction);
                break;
            case 'ping':
                await handlePing(interaction);
                break;
            case 'würfel':
                await handleDice(interaction);
                break;
            case 'münze':
                await handleCoinFlip(interaction);
                break;
            case 'casino':
                await handleCasino(interaction);
                break;
            case 'glücksrad':
                await handleWheel(interaction);
                break;
            case '8ball':
                await handle8Ball(interaction);
                break;
        }
    } catch (error) {
        console.error('Fehler bei Command:', error);
        const errorMessage = { content: '❌ Ein Fehler ist aufgetreten!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Command Handlers
async function handleClear(interaction) {
    const amount = interaction.options.getInteger('anzahl') || 10;
    
    try {
        const deleted = await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ 
            content: `🗑️ ${deleted.size} Nachrichten gelöscht!`, 
            ephemeral: true 
        });
    } catch (error) {
        await interaction.reply({ 
            content: '❌ Fehler beim Löschen der Nachrichten! (Nachrichten könnten zu alt sein)', 
            ephemeral: true 
        });
    }
}

async function handleKick(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    
    try {
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.kickable) {
            return await interaction.reply({ 
                content: '❌ Ich kann diesen User nicht kicken!', 
                ephemeral: true 
            });
        }

        await member.kick(reason);
        
        const embed = new EmbedBuilder()
            .setColor(0xff9900)
            .setTitle('👢 User gekickt')
            .addFields(
                { name: 'User', value: `${user.tag}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Grund', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({ 
            content: '❌ Fehler beim Kicken des Users!', 
            ephemeral: true 
        });
    }
}

async function handleMute(interaction) {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minuten') || 10;
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    
    try {
        const member = await interaction.guild.members.fetch(user.id);
        const muteTime = minutes * 60 * 1000; // in milliseconds
        
        await member.timeout(muteTime, reason);

        const embed = new EmbedBuilder()
            .setColor(0xffaa00)
            .setTitle('🔇 User gemutet')
            .addFields(
                { name: 'User', value: `${user.tag}`, inline: true },
                { name: 'Dauer', value: `${minutes} Minuten`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Grund', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({ 
            content: '❌ Fehler beim Muten des Users!', 
            ephemeral: true 
        });
    }
}

async function handleBan(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    
    try {
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.bannable) {
            return await interaction.reply({ 
                content: '❌ Ich kann diesen User nicht bannen!', 
                ephemeral: true 
            });
        }

        await member.ban({ reason });

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🔨 User gebannt')
            .addFields(
                { name: 'User', value: `${user.tag}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Grund', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({ 
            content: '❌ Fehler beim Bannen des Users!', 
            ephemeral: true 
        });
    }
}

async function handleServerInfo(interaction) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`📊 ${guild.name} - Server Info`)
        .setThumbnail(guild.iconURL())
        .addFields(
            { name: '👥 Mitglieder', value: `${guild.memberCount}`, inline: true },
            { name: '📅 Erstellt am', value: guild.createdAt.toLocaleDateString('de-DE'), inline: true },
            { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: '💬 Text Channels', value: `${guild.channels.cache.filter(c => c.type === 0).size}`, inline: true },
            { name: '🔊 Voice Channels', value: `${guild.channels.cache.filter(c => c.type === 2).size}`, inline: true },
            { name: '📋 Rollen', value: `${guild.roles.cache.size}`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleUserInfo(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    try {
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`👤 ${user.tag} - User Info`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Account erstellt', value: user.createdAt.toLocaleDateString('de-DE'), inline: true },
                { name: '📋 Höchste Rolle', value: member.roles.highest.name, inline: true },
                { name: '🚪 Server beigetreten', value: member.joinedAt.toLocaleDateString('de-DE'), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({ 
            content: '❌ Fehler beim Abrufen der User-Informationen!', 
            ephemeral: true 
        });
    }
}

async function handleAvatar(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`🖼️ ${user.tag}'s Avatar`)
        .setImage(user.displayAvatarURL({ size: 512, dynamic: true }))
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handlePing(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🏓 Pong!')
        .addFields(
            { name: 'Bot Latenz', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
            { name: 'API Latenz', value: `${Math.round(client.ws.ping)}ms`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

// Gambling Commands
async function handleDice(interaction) {
    const sides = interaction.options.getInteger('seiten') || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    
    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🎲 Würfel geworfen!')
        .setDescription(`Du hast eine **${result}** gewürfelt! (1-${sides})`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleCoinFlip(interaction) {
    const result = Math.random() < 0.5 ? 'Kopf' : 'Zahl';
    const emoji = result === 'Kopf' ? '🪙' : '💰';
    
    const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle(`${emoji} Münzwurf!`)
        .setDescription(`Die Münze zeigt: **${result}**`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleCasino(interaction) {
    const bet = interaction.options.getInteger('einsatz') || 10;
    const slots = ['🍎', '🍊', '🍋', '🍇', '🍓', '💎', '7️⃣'];
    
    const result1 = slots[Math.floor(Math.random() * slots.length)];
    const result2 = slots[Math.floor(Math.random() * slots.length)];
    const result3 = slots[Math.floor(Math.random() * slots.length)];
    
    let winAmount = 0;
    let message = '';
    
    if (result1 === result2 && result2 === result3) {
        if (result1 === '💎') {
            winAmount = bet * 10;
            message = '💎 JACKPOT! 💎';
        } else if (result1 === '7️⃣') {
            winAmount = bet * 5;
            message = '🎰 SUPER WIN! 🎰';
        } else {
            winAmount = bet * 3;
            message = '🎉 GEWONNEN! 🎉';
        }
    } else if (result1 === result2 || result2 === result3 || result1 === result3) {
        winAmount = Math.floor(bet * 1.5);
        message = '✨ Kleiner Gewinn! ✨';
    } else {
        message = '💸 Verloren... 💸';
    }
    
    const embed = new EmbedBuilder()
        .setColor(winAmount > 0 ? 0x00ff00 : 0xff0000)
        .setTitle('🎰 Casino Slots 🎰')
        .setDescription(`${result1} | ${result2} | ${result3}`)
        .addFields(
            { name: 'Ergebnis', value: message, inline: true },
            { name: 'Einsatz', value: `${bet} Münzen`, inline: true },
            { name: 'Gewinn', value: `${winAmount} Münzen`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleWheel(interaction) {
    const prizes = [
        { name: '💰 1000 Münzen', chance: 5 },
        { name: '💎 Diamant', chance: 2 },
        { name: '🎁 Mystery Box', chance: 10 },
        { name: '🍀 Glücksklee', chance: 15 },
        { name: '⭐ Stern', chance: 20 },
        { name: '🥉 Bronze', chance: 25 },
        { name: '💸 Nichts', chance: 23 }
    ];
    
    const rand = Math.random() * 100;
    let cumulative = 0;
    let won = null;
    
    for (const prize of prizes) {
        cumulative += prize.chance;
        if (rand <= cumulative) {
            won = prize;
            break;
        }
    }
    
    const embed = new EmbedBuilder()
        .setColor(0xff6b35)
        .setTitle('🎡 Glücksrad gedreht!')
        .setDescription(`Das Rad dreht sich... 🌪️\n\n**Du hast gewonnen: ${won.name}**`)
        .setFooter({ text: `Gewinnchance: ${won.chance}%` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handle8Ball(interaction) {
    const question = interaction.options.getString('frage');
    const answers = [
        'Es ist sicher.',
        'Ohne Zweifel.',
        'Ja definitiv.',
        'Du kannst dich darauf verlassen.',
        'So wie ich es sehe, ja.',
        'Höchstwahrscheinlich.',
        'Die Zeichen stehen gut.',
        'Ja.',
        'Antwort unklar, frag nochmal.',
        'Frag später nochmal.',
        'Ich kann dir jetzt nicht antworten.',
        'Konzentriere dich und frag nochmal.',
        'Verlass dich nicht darauf.',
        'Meine Antwort ist nein.',
        'Meine Quellen sagen nein.',
        'Die Zeichen stehen schlecht.',
        'Sehr zweifelhaft.'
    ];
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    const embed = new EmbedBuilder()
        .setColor(0x8b00ff)
        .setTitle('🎱 Magische 8-Ball')
        .addFields(
            { name: '❓ Frage', value: question },
            { name: '🔮 Antwort', value: `*${answer}*` }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

// Error handling for uncaught exceptions
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Login
client.login(process.env.DISCORD_TOKEN);
