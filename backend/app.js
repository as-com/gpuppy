const express = require('express');
const path = require('path');
const http = require('http');
const multer = require('multer');
const mongoose = require('mongoose');
const morgan = require('morgan');
const uuidv4 = require('uuid/v4');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
app.use(morgan('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, './uploads'),
        filename: (req, file, cb) => {
            const filename = uuidv4();
            return cb(null, filename + '.tar.gz')
        },
    }),
});
app.use('/api/datum', express.static('./uploads'));

const artifactDirectory = './artifacts';
app.use('/api/artum', express.static(artifactDirectory));

mongoose.connect('mongodb://localhost:27017/gpuppy', {
    useNewUrlParser: true,
    useFindAndModify: false,
}, (err) => {
    if (err)
        throw err;
    console.log("DB connected!");
});

const Job = mongoose.model('Job', {
    filename: String,
    command: String,
    status: {type: Number, default: 0},
    output: {type: String, default: ""},
});

const port = 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const outputMap = {};
const listenerMap = {};

wss.on('connection', (ws, request) => {
    const url = request.url;
    const regex = /.+\/(.+?)\/(listen|push)/;

    console.log(url);
    const m = regex.exec(url);
    if (m === null) throw m;

    const jobId = m[1];
    const op = m[2];

    if (op === 'listen') {
        if (!listenerMap.hasOwnProperty(jobId)) {
            listenerMap[jobId] = [];
        }
        listenerMap[jobId].push(ws);

        if (!outputMap.hasOwnProperty(jobId)) {
            outputMap[jobId] = "";
        } else {
            ws.send(outputMap[jobId]);
        }
    } else {
        // op == 'push'
        if (!outputMap.hasOwnProperty(jobId)) {
            outputMap[jobId] = "";
        }
        if (!listenerMap.hasOwnProperty(jobId)) {
            listenerMap[jobId] = [];
        }

        ws.on('message', (message) => {
            console.log(message);
            outputMap[jobId] += message;

            listenerMap[jobId].forEach(listener => {
                listener.send(message);
            })
        });
    }
});

app.post('/api/jobs', upload.single('file'), function (req, res, next) {
    const filename = req.file.filename;
    const command = req.query.command;

    const job = new Job({filename, command, status: 0});
    job.save()
        .then(() => {
            res.json({
                'status': 'job_queued',
            })
        })
        .catch(next);
});

app.get('/api/jobs', (req, res, next) => {
    Job.find({}, (err, jobs) => {
        if (err)
            return next(err);

        return res.json({
            jobs: jobs.map(job => job.toObject()),
        })
    });
});

app.post('/api/getJob', (req, res, next) => {
    Job.findOneAndUpdate({status: 0}, {status: 1}, (err, job) => {
        if (err)
            return next(err);
        if (job === null)
            return res.json([]);
        return res.json([job.toObject()])
    })
});

app.post('/api/jobs/:id/finish', (req, res, next) => {
    const artifact64 = req.body.artifact;
    const jobId = req.params.id;

    const artifact = Buffer.from(artifact64, 'base64');
    // TODO: Should sanitize the filename.
    fs.writeFile(path.join(artifactDirectory, jobId + '.tar.gz'), artifact, (err) => {
        if (err)
            return next(err);

        let output = "";
        console.log(outputMap);
        if (outputMap.hasOwnProperty(jobId)) {
            output = outputMap[jobId];
            delete outputMap[jobId];
        }
        if (listenerMap.hasOwnProperty(jobId)) {
            listenerMap[jobId].forEach(listener => listener.close());
            delete listenerMap[jobId];
        }
        Job.findOneAndUpdate({_id: jobId}, {status: 10, output}, (err, job) => {
            if (err)
                return next(err);
            return res.json({'status': 'job_finished'})
        });
    })
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});