import { command } from "./types";

const  commands: command[] = [];

// PING
const pingModule = require('./commands/ping/ping');
const pingCommand: command = pingModule["ping"];
commands.push(pingCommand);

// CAPTION
const captionModule = require('./commands/imageEditing/caption');
const captionCommand: command = captionModule["caption"];
commands.push(captionCommand);

// 8BALL
const ballModule = require('./commands/ball/ball');
const ballCommand: command = ballModule["ball"];
commands.push(ballCommand);

// AVATAR
const avatarModule = require('./commands/avatar/avatar');
const avatarCommand: command = avatarModule["avatar"];
commands.push(avatarCommand);

// BANNER
const bannerModule = require('./commands/banner/banner');
const bannerCommand: command = bannerModule["banner"];
commands.push(bannerCommand);

// KILL
const killModule = require('./commands/interact/kill/kill');
const killCommand: command = killModule["kill"];
commands.push(killCommand);

// COUNT
const countModule = require('./commands/count/count');
const countCommand: command = countModule["count"];
commands.push(countCommand);

// CAT
const catModule = require('./commands/cat/cat');
const catCommand: command = catModule["cat"];
commands.push(catCommand);

// QUOTE
const quoteModule = require('./commands/quote/quote');
const quoteCommand: command = quoteModule["quote"];
commands.push(quoteCommand);

// DEEPFRY
const deepfryModule = require('./commands/imageEditing/deepfry');
const deepfryCommand: command = deepfryModule["deepfry"];
commands.push(deepfryCommand);

// SLAP
const slapModule = require('./commands/interact/slap/slap');
const slapCommand: command = slapModule["slap"];
commands.push(slapCommand);

// HEADPAT
const headpatModule = require('./commands/interact/headpat/headpat');
const headpatCommand: command = headpatModule["headpat"];
commands.push(headpatCommand);

// HUG
const hugModule = require('./commands/interact/hug/hug');
const hugCommand: command = hugModule["hug"];
commands.push(hugCommand);

export { commands };