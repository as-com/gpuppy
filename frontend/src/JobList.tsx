import React from "react";
import {Job} from "./job";

export class JobList extends React.Component<{}, {
    jobs: Job[] | null
}> {

    constructor(props: {}) {
        super(props);

        this.state = {
            jobs: null
        }
    }

    componentDidMount() {
        this.fetchStuff();
        setInterval(x => {
            this.fetchStuff();
        }, 2000);
    }

    fetchStuff() {
        fetch("/api/jobs").then(r => r.json())
            .then(x => {
                this.setState({
                    jobs: x.jobs
                })
            });
    }

    render() {
        let jobs = this.state.jobs;
        if (jobs === null) {
            return <div>Loading...</div>
        } else {
            return <div>
                <h2>Jobs</h2>
                <table className={"jobs table"}>
                    <thead>
                    <tr>
                        <th>Job ID</th>
                        {/*<th>Filename</th>*/}
                        <th>Command</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {jobs.map(x => <tr key={x._id}>
                        <td>{x._id}</td>
                        {/*<td>{x.filename}</td>*/}
                        <td><code>{x.command}</code></td>
                        <td>{x.status === 0 ? <span className="badge badge-secondary">New</span> :
                        x.status === 1 ? <span className="badge badge-info">Running</span> :
                        x.status === 10 ? <span className="badge badge-success">Done</span> :
                        <span className="badge badge-danger">Unknown</span>}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
        }
    }
}
