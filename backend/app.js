const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const morgan = require('morgan');
const uuidv4 = require('uuid/v4');
const bodyParser = require('body-parser');

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

mongoose.connect('mongodb://localhost:27017/gpuppy', {
    useNewUrlParser: true
}, (err) => {
    if (err)
        throw err;
    console.log("DB connected!");
});

const Job = mongoose.model('Job', {
    filename: String,
    command: String,
    status: Number,
    output: String,
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
            return res.json([]);
        return res.json([job.toObject()])
    })
});

const port = 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});