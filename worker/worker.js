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
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
        const job = await got(`${SERVER}/api/getJob`, {
            method: "POST",
            json: true
        });

        if (job.body.length === 0) {
            continue;
        }

        console.log(job.body);
        const theJob = job.body[0];

        // console.log(job);

        // Grab the tarball
        const dirname = "" + Date.now();
        fs.mkdirSync(dirname);
        fs.writeFileSync(path.join(dirname, "download.tar.gz"), (await got(`${SERVER}/api/datum/${theJob.filename}`, {encoding: null})).body);
        const extOut = child_process.execSync("tar -xf download.tar.gz", {
            cwd: dirname
        });
        console.log(extOut);
        fs.unlinkSync(path.join(dirname, "download.tar.gz"));

        await new Promise((resolve, reject) => {
            const client = new WebSocket(`${WS_SERVER}/api/${theJob._id}/push/`);
            client.on("open", () => {
                const p = child_process.exec(theJob.command, {
                    cwd: dirname,
                    maxBuffer: 1024*1024*1024
                });

                p.stdout.on("data", (data) => {
                    process.stdout.write(data);
                    client.send(data);
                });

                p.stderr.on("data", (data) => {
                    process.stderr.write(data);
                    client.send(data);
                });

                p.on("close", () => {
                    client.close();
                    resolve();
                })
            });
        });

        const createOut = child_process.execSync("tar -cvzf upload.tar.gz .", {
            cwd: dirname
        });

        await got(`${SERVER}/api/jobs/${theJob._id}/finish`, {
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
