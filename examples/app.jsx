import React from 'react';
import ReactDom from 'react-dom';

import { TimeEdit, Spinner, Grid } from '../lib/es';

const gridData = generateTableData(100);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTime: defaultTime()
        };
    }

    onTimeChange(newTime) {
        this.setState({currentTime: newTime});
    }

    formatTime() {
        if (!this.state.currentTime) {
            return 'null';
        }

        return formatTime(this.state.currentTime);
    }

    setDefaultTime() {
        this.setState({currentTime: defaultTime()});
    }

    render() {
        return (
            <div>
                <TimeEdit value={ this.state.currentTime } onChange={ this.onTimeChange.bind(this) } width={ 100 }/>

                <span>{ this.formatTime() }</span>

                <button type="button" onClick={ this.setDefaultTime.bind(this) }>Установить 12:00</button>

                <hr/>

                <div>
                    <Spinner style={{fontSize: 20}}/>
                </div>

                <hr/>

                <div style={{width: 500, height: 300}}>
                    <SingleSelectionGrid data={ gridData } />
                </div>

                <div style={{width: 500, height: 300}}>
                    <MultiSelectionGrid data={ gridData }/>
                </div>
            </div>
        );
    }
}

class SingleSelectionGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: -1
        };

        this.onSelection = this.onSelection.bind(this);
    }

    onSelection(selection) {
        this.setState({selection});
    }

    render() {
        const { data } = this.props;

        return (
            <Grid dataSource={ data }
                  selection={ this.state.selection } onSelection={ this.onSelection }
                  columns={[
                      { dataKey: 'name', label: 'Наименование', width: 200, minWidth: 400, flexGrow: 1 }
                  ]}
                />
        );
    }
}

class MultiSelectionGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: {}
        };

        this.onSelection = this.onSelection.bind(this);
    }

    onSelection(selection) {
        this.setState({selection});
    }

    render() {
        const { data } = this.props;

        return (
            <Grid dataSource={ data }
                  selection={ this.state.selection } onSelection={ this.onSelection }
                  columns={[
                      { dataKey: 'name', label: 'Наименование', width: 200, minWidth: 400, flexGrow: 1 }
                  ]}
                  className='striped'
                />
        );
    }
}

function defaultTime() {
    const time = new Date();
    time.setHours(12, 0);
    return time;
}

function formatTime(time) {
    if (!time) {
        return '';
    }

    const
        hoursStr = padLeft('00', time.getHours()),
        minutesStr = padLeft('00', time.getMinutes());
    return `${hoursStr}:${minutesStr}`;
}

function padLeft(mask, value) {
    return String(mask + value).slice(-mask.length);
}

function generateTableData(count) {
    const result = [];
    for (let i = 1; i <= count; i++) {
        result.push({
            id: i,
            name: 'test' + i
        });
    }
    return result;
}

ReactDom.render(
    <App />,
    document.getElementById('react-content')
);

