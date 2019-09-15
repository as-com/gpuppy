import React from "react";

interface IWorker {
    name: string,
    gpuUtil: number,
    cpuUtil: number,
    gpuMem: number,
    cpuMem: number,
    gpuPower: number
}

function Worker(props: { worker: IWorker }) {
    return <div>
        CPU: {(props.worker.cpuUtil * 100).toFixed(1)}%<br />
        Memory: {(props.worker.cpuMem/100 * 7).toFixed(1)} / 7.0 G<br />
        GPU: {props.worker.gpuUtil}%<br/>
        VRAM: {(props.worker.gpuMem * 16).toFixed(1)} / 16.0 G<br />
        GPU Power: {props.worker.gpuPower} W<br/>
    </div>
}

export class Workers extends React.Component<{}, {
    workers: IWorker[]
}> {
    constructor(props: any) {
        super(props);

        this.state = {
            workers: []
        }
    }

    componentDidMount() {
        this.fetchStuff();
        setInterval(x => {
            this.fetchStuff();
        }, 2000);
    }

    fetchStuff() {
        fetch("/api/workers").then(r => r.json())
            .then(x => {
                this.setState({
                    workers: x
                })
            });
    }

    render() {
        return <div>
            <h2>Workers</h2>
            {this.state.workers.map(w => <div key={w.name}>
                <h3>{w.name}</h3>
                <Worker worker={w} />
            </div>)}
        </div>
    }
}
