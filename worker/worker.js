const got = require("got");
const child_process = require("child_process");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const SERVER = process.argv[2];
const WS_SERVER = process.argv[3];
console.log(SERVER, WS_SERVER);

async function main() {
    while (true) {
        const job = await got(`${SERVER}/api/getJob`, {
            method: "POST",
            json: true
        });

        if (job.length === 0) {
            continue;
        }

        const theJob = job[0];

        // Grab the tarball
        const dirname = "" + Date.now();
        fs.writeFileSync("download.tar.gz", await got(`${SERVER}/api/datum/${theJob.filename}`));
        fs.mkdirSync(dirname);
        const extOut = child_process.execSync("tar -xf download.tar.gz", {
            cwd: dirname
        });
        console.log(extOut);
        fs.unlinkSync(path.join(dirname, "download.tar.gz"));

        await new Promise((resolve, reject) => {
            const client = new WebSocket(`${WS_SERVER}/api/${theJob._id}/push/`);
            client.on("open", () => {
                const process = child_process.exec(theJob.command, {
                    cwd: dirname,
                    maxBuffer: 1024*1024*1024
                });

                process.stdout.on("data", (data) => {
                    client.send(data);
                });

                process.stderr.on("data", (data) => {
                    client.send(data);
                });

                process.on("close", () => {
                    client.close();
                    resolve();
                })
            });
        });

        const createOut = child_process.execSync("tar -xf upload.tar.gz .", {
            cwd: dirname
        });

        await got(`${SERVER}/api/finishJob`, {
            method: "POST",
            json: true,
            body: {
                artifact: fs.readFileSync(path.join(dirname, "upload.tar.gz")).toString("base64")
            }
        });

        console.log("Uploaded to server");

        child_process.execSync(`rm -rf ${dirname}`);
    }
}

main().then(console.log).catch(console.error);
