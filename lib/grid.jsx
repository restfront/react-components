import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { AutoSizer, FlexTable, FlexColumn, SortDirection, SortIndicator } from 'react-virtualized';
import shallowCompare from 'react-addons-shallow-compare';
import Spinner from './spinner.jsx';

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

class Grid extends Component {
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

        const { idProperty, selection } = this.props;
        const record = this.getRecordByIndex(index);
        if (record && record[idProperty]) {
            const recordID = record[idProperty];
            if (typeof selection === 'object') {
                if (selection[recordID]) {
                    return 'selected';
                }
            } else {
                if (selection === recordID) {
                    return 'selected';
                }
            }
        }
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
        const {idProperty, selection, onSelection} = this.props;

        if (!idProperty || !onSelection) {
            return;
        }

        const record = this.getRecordByIndex(index);
        if (record && record[idProperty]) {
            const recordID = record[idProperty];
            if (typeof selection === 'object') {
                let newSelection;
                if (event.ctrlKey) {
                    newSelection = Object.assign({}, selection);
                    newSelection[recordID] = !newSelection[recordID];
                } else {
                    newSelection = {[recordID]: true};
                }

                onSelection(newSelection);
            } else {
                onSelection(recordID);
            }
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

                            rowGetter={ this._rowGetter.bind(this) }
                            rowCount={ this.props.dataSource.length }
                            rowClassName={ this._rowClassName.bind(this) }

                            height={ height }
                            width={ width }
                            tabIndex={ null }

                            onRowClick={ this._rowClickHandler.bind(this) }
                            rowRenderer={ customRowRenderer }
                            noRowsRenderer={ noRowsRenderer }

                            sort={ this.handleSort.bind(this) }
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

export default Grid;