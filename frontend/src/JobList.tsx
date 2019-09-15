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
                <table className={"jobs"}>
                    <tbody>
                    <tr>
                        <th>ID</th>
                        <th>Filename</th>
                        <th>Command</th>
                        <th>Status</th>
                    </tr>
                    {jobs.map(x => <tr key={x._id}>
                        <td>{x._id}</td>
                        <td>{x.filename}</td>
                        <td>{x.command}</td>
                        <td>{x.status}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
        }
    }
}
