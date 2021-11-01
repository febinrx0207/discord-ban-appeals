const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const process = require("process");

function assertSuccess(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
}

function replaceInFile(file, original, replacement, callback) {
    fs.readFile(file, "UTF-8", (err, data) => {
        assertSuccess(err);

        fs.writeFile(file, data.replace(original, replacement), "UTF-8", err => {
            assertSuccess(err);

            if (callback) {
                callback();
            }
        });
    });
}

async function main() {
    if (!process.env.USE_NETLIFY_FORMS) {
        fs.rename(path.resolve(__dirname, "api", "submission-created.js"), path.resolve(__dirname, "api", "submit-appeal.js"), assertSuccess);
        replaceInFile(path.resolve(__dirname, "public", "form.html"), "action=\"/success.html\" netlify", "action=\"/api/submit-appeal\"");
    }

    if (process.env.DISABLE_UNBAN_LINK) {
        fs.unlink(path.resolve(__dirname, "api", "unban.js"), assertSuccess);
    }

    const url = process.env.URL;
    replaceInFile(path.resolve(__dirname, "api", "oauth.js"), "URL_TO_REPLACE", `"${url}"`);
    replaceInFile(path.resolve(__dirname, "api", "oauth-callback.js"), "URL_TO_REPLACE", `"${url}"`);

    // Make sure the bot connected to the gateway at least once.
    const client = new Discord.Client();
    try {
        await client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
    client.destroy();
}

main();