const got = require("got");
const child_process = require("child_process");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

const SERVER = process.argv[2];
const WS_SERVER = process.argv[3];
console.log(SERVER, WS_SERVER);

const STAT_INTERVAL_MS = 1000;

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

        let startTime;
        let exitCode;
        await new Promise((resolve, reject) => {
            const client = new WebSocket(`${WS_SERVER}/api/${theJob._id}/push/`);
            client.on("open", () => {
                startTime = Date.now();
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

                p.on("exit", (code) => {
                    exitCode = code;
                    client.close();
                    resolve();
                })
            });
        });
        let finishTime = Date.now();

        const createOut = child_process.execSync("tar -cvzf ../upload.tar.gz .", {
            cwd: dirname
        });

        await got(`${SERVER}/api/jobs/${theJob._id}/finish`, {
            method: "POST",
            json: true,
            body: {
                artifact: fs.readFileSync(path.join(dirname, "../upload.tar.gz")).toString("base64"),
                startTime,
                finishTime,
                exitCode
            }
        });

        console.log("Uploaded to server");

        child_process.execSync(`rm -rf ${dirname}`);
    }
}

async function workerStats() {
    const hostname = os.hostname();
    let gpuUtil = 0;
    let cpuUtil = 0;
    let gpuMem = 0;
    let cpuMem = 0;
    let gpuPower = 0;

    function readGpuStats() {
        const proc = child_process.exec("nvidia-smi stats -d gpuUtil,memUtil,pwrDraw");

        const rl = readline.createInterface({input: proc.stdout});
        rl.on('line', (input) => {
            const split = input.split(',').map((s) => s.trim());

            const type = split[1];
            const value = 0 + split[3];
            if (type === "pwrDraw") {
                gpuPower = value;
            } else if (type === "memUtil") {
                gpuMem = value;
            } else if (type === "gpuUtil") {
                gpuUtil = value;
            } else {
                console.log("unknown event " + type);
            }
        })
    }

    function readCpuStats() {
        const output = child_process.execSync("top -b -d1 -n1|grep -i \"Cpu(s)\"|head -c21|cut -d ' ' -f3|cut -d '%' -f1");
        cpuUtil = 0 + output;
    }

    function readMemStats() {
        const output = child_process.execSync("free | grep Mem | awk '{print $3/$2 * 100.0}'");
        cpuMem = 0 + output;
    }

    async function pushStats() {
        await got(`${SERVER}/api/workers/${hostname}`, {
            method: "POST",
            json: true,
            body: {
                gpuUtil,
                cpuUtil,
                gpuMem,
                cpuMem,
                gpuPower,
            }
        })
    }

    readGpuStats();
    while (true) {
        await new Promise(resolve => {
            setTimeout(resolve, STAT_INTERVAL_MS);
        });

        readCpuStats();
        readMemStats();
        pushStats();
    }
}

main().then(console.log).catch(console.error);
workerStats().then(console.log).catch(console.error);
