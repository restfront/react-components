import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { AutoSizer, FlexTable, FlexColumn, SortDirection, SortIndicator } from 'react-virtualized';
import shallowCompare from 'react-addons-shallow-compare';
import * as classNames from 'classnames';
import Spinner from './spinner.js';

const cx = classNames.default;

class Grid extends Component {
    constructor(props) {
        super(props);

        this._lastSelIndex = -1;

        this._rowGetter = this._rowGetter.bind(this);
        this._rowClassName = this._rowClassName.bind(this);
        this._rowClickHandler = this._rowClickHandler.bind(this);
        this.handleSort = this.handleSort.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    getRecordByIndex(index) {
        return index < this.props.dataSource.length ? this.props.dataSource[index] : null;
    }

    _rowGetter({ index }) {
        return this.getRecordByIndex(index);
    }

    _rowClassName({ index }) {
        if (index < 0) {
            return;
        }

        const classes = {};

        // Состояние выделения
        const { idProperty, selection } = this.props;
        const record = this.getRecordByIndex(index);
        if (record && record[idProperty]) {
            const recordID = record[idProperty];
            if (typeof selection === 'object') {
                if (selection[recordID]) {
                    classes.selected = true;
                }
            } else {
                if (selection === recordID) {
                    classes.selected = true;
                }
            }
        }

        // Нечетность
        if (index % 2 === 0) {
            classes.even = true;
        } else {
            classes.odd = true;
        }

        return cx(classes);
    }

    _rowClickHandler({ index, event }) {
        const onRowClick = this.props.onRowClick;

        // Если указан обработчик клика по строке, то вызовем его
        if (onRowClick) {
            onRowClick({index});
        }

        this.handleSelection(index, event);
    }

    handleSelection(index, event) {
        const { idProperty, dataSource, selection, onSelection } = this.props;

        if (!idProperty || !onSelection) {
            return;
        }

        const record = this.getRecordByIndex(index);
        if (!record || !record[idProperty]) {
            return;
        }

        const recordID = record[idProperty];
        // Если в selection указан объект, то будет работать множественный выбор
        if (typeof selection === 'object') {
            let newSelection;

            // Клик с зажатым CTRL переключает состояние выбора строки
            if (event.ctrlKey) {
                newSelection = Object.assign({}, selection);
                newSelection[recordID] = !newSelection[recordID];

                this._lastSelIndex = index;

                // Клик с зажатым SHIFT позволяет выделить все от прошлого клика
            } else if (event.shiftKey) {
                newSelection = Object.assign({}, selection);
                // Если уже было чтото выделено, то выделяем все от прошлой строки
                if (this._lastSelIndex >= 0) {
                    selectRange(dataSource, newSelection, idProperty, this._lastSelIndex, index);
                } else {
                    newSelection[recordID] = !newSelection[recordID];

                    this._lastSelIndex = index;
                }
            } else {
                newSelection = {[recordID]: true};

                this._lastSelIndex = index;
            }

            onSelection(newSelection);
        } else {
            // Одиночный выбор
            onSelection(recordID);
        }
    }

    handleSort(params) {
        const { onSorting } = this.props;
        if (!onSorting) {
            return;
        }

        if (params.sortBy) {
            const column = _.find(this.props.columns, {dataKey: params.sortBy});
            if (column && column.type) {
                params.type = column.type;
            }
        }

        if (onSorting) {
            onSorting(params);
        }
    }

    render() {
        const { loading, headerHeight, onSorting, sorting } = this.props;

        const columns = this.props.columns.map(function (column, index) {
            if (!column.width) {
                column.width = 10;
            }

            if (!column.cellRenderer) {
                column.cellRenderer = defaultCellRenderer;
            } else {
                column.cellRenderer = ifEmptyCellDecorator(column.cellRenderer);
            }

            return (<FlexColumn key={ index } {...column} />);
        });

        return (
            <AutoSizer>
                {({width, height}) => (
                    <div style={{ width, height }}>
                        <GridLoadingShade visible={ loading } width={ width } height={ height }
                                          marginTop={ headerHeight }/>

                        <FlexTable
                            {...this.props}

                            rowGetter={ this._rowGetter }
                            rowCount={ this.props.dataSource.length }
                            rowClassName={ this._rowClassName }

                            height={ height }
                            width={ width }
                            tabIndex={ null }

                            onRowClick={ this._rowClickHandler }
                            rowRenderer={ customRowRenderer }
                            noRowsRenderer={ noRowsRenderer }

                            sort={ this.handleSort }
                            sortBy={ sorting && sorting.sortBy }
                            sortDirection={ sorting && sorting.sortDirection }>

                            { columns }
                        </FlexTable>
                    </div>
                )}
            </AutoSizer>
        );
    }
}

Grid.propTypes = {
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,

    idProperty: PropTypes.string,
    headerHeight: PropTypes.number,
    rowHeight: PropTypes.number,
    overscanRowCount: PropTypes.number,
    rowClassName: PropTypes.func,
    onRowClick: PropTypes.func,
    loading: PropTypes.bool,

    selection: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    onSelection: PropTypes.func,

    sorting: PropTypes.object,
    onSorting: PropTypes.func
};

Grid.defaultProps = {
    idProperty: 'id',
    headerHeight: 23,
    rowHeight: 25,
    overscanRowCount: 10
};

Grid.unstable_handleError = (e) => console.error(e);

const GridLoadingShade = (props) => {
    const { visible, width, height, marginTop } = props;

    if (!visible) {
        return null;
    }

    // Настраиваем размеры и отступы, чтобы макса лежала внутри грида, под заголовком
    const styles = {
        width: width - 2,
        height: height - marginTop - 2,
        fontSize: '125%',
        marginTop: marginTop + 1,
        marginLeft: 1
    };

    return (
        <div className="FlexTable__loadingShade" style={ styles }>
            <Spinner />
            <span style={{marginLeft: '15px'}}>Загрузка данных</span>
        </div>
    );
};

function customRowRenderer({
    className,
    columns,
    index,
    isScrolling,
    onRowClick,
    onRowDoubleClick,
    onRowMouseOver,
    onRowMouseOut,
    rowData,
    style
    }) {

    const props = {};
    if (onRowClick || onRowDoubleClick || onRowMouseOver || onRowMouseOut) {
        props['aria-label'] = 'row';
        props.role = 'row';

        if (onRowClick) {
            props.onClick = (event) => onRowClick({index, event})
        }
        if (onRowDoubleClick) {
            props.onDoubleClick = (event) => onRowDoubleClick({index, event})
        }
        if (onRowMouseOut) {
            props.onMouseOut = (event) => onRowMouseOut({index, event})
        }
        if (onRowMouseOver) {
            props.onMouseOver = (event) => onRowMouseOver({index, event})
        }
    }

    return (
        <div
            {...props}
            className={className}
            style={style}
            >
            {columns}
        </div>
    );
}

function noRowsRenderer() {
    return (
        <div className="empty">
            Нет записей
        </div>
    );
}

function defaultCellRenderer({ cellData }) {
    if (cellData == null || cellData == '') {
        return '\u00a0'
    } else {
        return String(cellData)
    }
}

function ifEmptyCellDecorator(callback) {
    return function (params) {
        const text = callback(params);
        if (text == null || String(text).trim() === '') {
            return '\u00a0'
        }
        return text;
    }
}

function selectRange(data, selection, idProperty, fromIndex, toIndex) {
    const from = Math.max(Math.min(fromIndex, toIndex), 0);
    const to = Math.min(Math.max(fromIndex, toIndex), data.length);

    for (let counter = from; counter <= to; counter++) {
        const record = data[counter];
        const recordID = record[idProperty];
        selection[recordID] = true;
    }
}

export default Grid;