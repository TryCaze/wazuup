import { ApplicationCommandOptionType, ApplicationCommandType, Client, CommandInteraction } from "discord.js";
import { command } from "../../../types";

export const kill: command = {
    name: "kill",
    description: "Generate a death for a user",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Choose who to kill",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    run: async (_client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand())
            return;

        const target = interaction.options.getUser("user") || interaction.user;

        const scenarios = [
            "was run over by a Toyota Corolla while running from Canada geese.",
            "was consumed by sentient slime during a failed science experiment.",
            "tried to pet a wild lion. It did not end well.",
            "opened a cursed PDF and was dragged into another dimension.",
            "slipped on a banana peel and fell into the void.",
            "was blasted into space by a rogue vending machine.",
            "challenged a goose to a duel. The goose brought friends.",
            "attempted to unplug the internet. Reality collapsed.",
            "looked directly into the sun for too long.",
            "got too close to the microwave while it was running.",
            "was crushed by Hatsune Miku's leek.",
            "disrespected Kasane Teto. She did not like that.",
            "tried to out-sing Neru and suffered critical vocal failure.",
            "tried Walter White's blue meth and turned into a crystal statue.",
            "got run over by Saul Goodman's inflatable Statue of Liberty.",
            "was dissolved in a bathtub by incompetent drug dealers.",
            "ate Gus Fring's Los Pollos Hermanos and exploded.",
            "got stuck in the vacuum repair shop with no way out.",
            "was buried alive by Mike Ehrmantraut's half-measures.",
            "tried to out-lawyer Saul and was legally erased from existence.",
            "did not call Saul",
            "got poisoned by Lydia's stevia and melted into a puddle.",
            "was crushed by falling money in Walter White's storage unit.",
            "tried to cook chili powder meth and became the universe's worst drug lord.",
            "was misdiagnosed by Dr. House and given the wrong medicine.",
            "was diagonsed with lupus",
            "tried to outsmart House and suffered a medical paradox.",
            "got run over by House's motorcycle during a clinic escape.",
            "was inhaled by Kirby and never seen again.",
            "was crushed by Dedede's hammer during a shopping spree.",
            "got sucked into Kirby's mouth vacuum at light speed.",
            "tried to steal Kirby's strawberry shortcake and suffered the consequences.",
            "got hit by Bandana Dee's spear throw from across the arena.",
            "was caught in Third Impact and turned into fanta.",
            "got stepped on by Unit-01 during a berserk rampage.",
            "was dissolved in LCL after failing the Human Instrumentality test.",
            "got hit by Kaworu's piano during an angel attack.",
            "was erased by Gendo's secret NERV plans.",
            "was crushed by Misato's beer can collection.",
            "got lost in the Wired and was deleted by system admin.",
            "was disconnected from reality by Lain's god complex.",
            "was exploded by Megumin's daily spell.",
            "got scammed by Aqua and sold to the devil.",
            "was crushed by Darkness's failed attempt at being useful.",
            "got killed by Kazuma's steal skill (he took their heart... literally).",
            "was crushed by Bocchi's social anxiety aura.",
            "got hit by Nijika's drumstick during a practice session.",
            "was banned from the internet by God Himself.",
            "got hit by a flying Windows update notification.",
            "was killed by their own Google search history leaking.",
            "tried to microwave their phone to charge it faster.",
            "got flattened by the weight of unread emails.",
            "tried to fight a Roomba and lost spectacularly.",
            "got stuck in an infinite IKEA loop.",
            "was banned from life for using Comic Sans unironically.",
            "tried to out-pizza the Hut and suffered the consequences.",
            "tried to download more RAM and exploded.",
            "was killed by their own smart fridge for eating too much.",
            "got dropkicked by Goldshi",
            "drank too much Monster"
        ];

        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        await interaction.reply({
            content: `<@${target.id}> ${randomScenario}`
        });
    },
};