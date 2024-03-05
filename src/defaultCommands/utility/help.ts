import { Collection, CommandInteraction, EmbedBuilder } from "discord.js"
import LunaClient from "../.."
import { CommandBase, ECommandOptionTypes, CommandOption } from "../../base/CommandBase"

export default class Help extends CommandBase {
    constructor() {
        super({
            // isTesting: true,
            description: "See the help menu and the available commands!!",
            options: [
                {
                    type: ECommandOptionTypes.TEXT,
                    name: 'command',
                    description: 'the command you want to get more info about',
                    required: false
                }
            ]
        })
    }

    run(c: LunaClient, ctx: CommandInteraction) {
        //@ts-expect-error
        let commands = c.commandHandler.commands
        let commandName = ctx.options.data.length > 0 ? ctx.options.data[0].value : undefined

        if (commandName !== undefined) {
            let command = commands.get(commandName.toString())
            //@ts-expect-error
            if (command && (command.requiredMemberPermissions && ctx.memberPermissions.has(command.requiredMemberPermissions))) {
                ctx.reply({ content: 'Command not found!', ephemeral: true })
                return
            }; 
            if (command) {
                let usage = this.generateCommandUsage(command)
                // console.log(usage)

                let embed = new EmbedBuilder()
                    .setImage(c.user?.avatarURL({ extension: 'png'}) as string)
                    .setColor('Random')
                    .setTitle(`/${commandName}!`)
                    .setDescription(command.commandDescription)
                    .setFields(
                        { name: 'Usage', value: '[] - required Option\n<> - optional Option\n```' + usage + '```' }
                    )

                ctx.reply({ embeds: [embed] })
                return
            }
            else {
                ctx.reply({ content: 'Command not found!', ephemeral: true })
                return
            }
        }

        let list = this.generateList(commands)
        let embed = new EmbedBuilder()
            .setImage(c.user?.avatarURL() as string)
            .setColor('DarkButNotBlack')
            .setTitle('Help Menu')
            .setDescription(`Here are the commands that are availabe to use!\n\nTip:\n\`/<Command Name> <Args (optional/required)>\` - To use the Command\n\`/help <Command Name>\` - To get more info of that command`)

        list = new Map([...list.entries()].reverse())
        list.forEach((v, k) => {
            let commands: string[] = []
            v.commands.forEach((c: any) => {
                // console.log(c)
                if (c.requiredMemberPermissions) {
                    if (ctx.memberPermissions?.has(c.requiredMemberPermissions)) {
                        commands.push(`\`/${c.commandName}\``)
                    }
                } else {
                    commands.push(`\`/${c.commandName}\``)
                }
            })
            embed.addFields({ name: k.replaceAll('-', ' '), value: commands.join(', ') })
        })

        ctx.reply({
            embeds: [embed]
        })
    }

    generateCommandUsage(command: CommandBase): string {
        let usages = []

        let parseSubCommandGroup = (op: CommandOption) => {
            let str = `${op.name}`

            if (op.options && op.options.length > 0) {
                op.options.forEach((o) => {
                    // str += ` <${o.name}>`
                    if (o.type === ECommandOptionTypes.SUBCOMMAND) {
                        str += ` ${o.name}`
                        if (o.options && o.options.length > 0) {
                            o.options.forEach((subOption) => {
                                str += ` <${subOption.name}>`
                            })
                        }
                    } else if (o.type === ECommandOptionTypes.SUBCOMMAND_GROUP) {
                        str += ' ' + parseSubCommandGroup(o)
                    } else {
                        if (o.required) {
                            str += ` [${o.name}]`
                        } else {
                            str += ` <${o.name}>`
                        }
                    }
                })
            }

            return str
        }

        if (command.commandOptions && command.commandOptions.length > 0) {
            command.commandOptions.forEach((option) => {
                let use = `/${command.commandName}`
                if (option.type === ECommandOptionTypes.SUBCOMMAND) {
                    use += ` ${option.name}`;
                    if (option.options && option.options.length > 0) {
                        option.options.forEach((subOption) => {
                            use += ` <${subOption.name}>`;
                        });
                    }
                } else if (option.type === ECommandOptionTypes.SUBCOMMAND_GROUP) {
                    use += ' ' + parseSubCommandGroup(option)
                } else {
                    if (option.required) {
                        use += ` [${option.name}]`;
                    } else {
                        use += ` <${option.name}>`;
                    }
                }
                usages.push(use + '\n')
            });
        } else {
            usages.push(`/${command.commandName}`)
        }

        return usages.join('');
    }


    generateList(commands: Collection<string, CommandBase>) {
        let list = new Map<string, any>()
        commands.forEach(async (v, k) => {
            // console.log(v)
            let groups = v.group?.split('/').filter(v => v !== '') as string[]
            if (groups?.length > 0) {
                let lead = groups.shift() as string;
                let sub = [...groups]
                if (!list.has(lead)) list.set(lead, {
                    commands: [],
                    sub: {}
                })

                let groupList = list.get(lead) as any

                if (sub.length <= 0) {
                    groupList.commands.push(v)
                }

                list.set(lead, groupList)
            } else {
                if (!list.has('no-group')) list.set('no-group', {
                    commands: [],
                    sub: {}
                })

                let groupList = list.get('no-group') as any
                if (v.showHelp) {
                    groupList.commands.push(v)
                }

                list.set('no-group', groupList)
            }
        })

        // console.log(list)
        return list
    }
}