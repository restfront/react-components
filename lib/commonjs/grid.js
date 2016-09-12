'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactVirtualized = require('react-virtualized');

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _spinner = require('./spinner.js');

var _spinner2 = _interopRequireDefault(_spinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GridLoadingShade = function GridLoadingShade(props) {
    var visible = props.visible;
    var width = props.width;
    var height = props.height;
    var marginTop = props.marginTop;


    if (!visible) {
        return null;
    }

    // Настраиваем размеры и отступы, чтобы макса лежала внутри грида, под заголовком
    var styles = {
        width: width - 2,
        height: height - marginTop - 2,
        fontSize: '125%',
        marginTop: marginTop + 1,
        marginLeft: 1
    };

    return _react2.default.createElement(
        'div',
        { className: 'FlexTable__loadingShade', style: styles },
        _react2.default.createElement(_spinner2.default, null),
        _react2.default.createElement(
            'span',
            { style: { marginLeft: '15px' } },
            'Загрузка данных'
        )
    );
};

var Grid = function (_Component) {
    _inherits(Grid, _Component);

    function Grid() {
        _classCallCheck(this, Grid);

        return _possibleConstructorReturn(this, (Grid.__proto__ || Object.getPrototypeOf(Grid)).apply(this, arguments));
    }

    _createClass(Grid, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return (0, _reactAddonsShallowCompare2.default)(this, nextProps, nextState);
        }
    }, {
        key: 'getRecordByIndex',
        value: function getRecordByIndex(index) {
            return index < this.props.dataSource.length ? this.props.dataSource[index] : null;
        }
    }, {
        key: '_rowGetter',
        value: function _rowGetter(_ref) {
            var index = _ref.index;

            return this.getRecordByIndex(index);
        }
    }, {
        key: '_rowClassName',
        value: function _rowClassName(_ref2) {
            var index = _ref2.index;

            if (index < 0) {
                return;
            }

            var _props = this.props;
            var idProperty = _props.idProperty;
            var selection = _props.selection;

            var record = this.getRecordByIndex(index);
            if (record && record[idProperty]) {
                var recordID = record[idProperty];
                if ((typeof selection === 'undefined' ? 'undefined' : _typeof(selection)) === 'object') {
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
    }, {
        key: '_rowClickHandler',
        value: function _rowClickHandler(_ref3) {
            var index = _ref3.index;
            var event = _ref3.event;

            var onRowClick = this.props.onRowClick;

            // Если указан обработчик клика по строке, то вызовем его
            if (onRowClick) {
                onRowClick({ index: index });
            }

            this.handleSelection(index, event);
        }
    }, {
        key: 'handleSelection',
        value: function handleSelection(index, event) {
            var _props2 = this.props;
            var idProperty = _props2.idProperty;
            var selection = _props2.selection;
            var onSelection = _props2.onSelection;


            if (!idProperty || !onSelection) {
                return;
            }

            var record = this.getRecordByIndex(index);
            if (record && record[idProperty]) {
                var recordID = record[idProperty];
                if ((typeof selection === 'undefined' ? 'undefined' : _typeof(selection)) === 'object') {
                    var newSelection = void 0;
                    if (event.ctrlKey) {
                        newSelection = Object.assign({}, selection);
                        newSelection[recordID] = !newSelection[recordID];
                    } else {
                        newSelection = _defineProperty({}, recordID, true);
                    }

                    onSelection(newSelection);
                } else {
                    onSelection(recordID);
                }
            }
        }
    }, {
        key: 'handleSort',
        value: function handleSort(params) {
            var onSorting = this.props.onSorting;

            if (!onSorting) {
                return;
            }

            if (params.sortBy) {
                var column = _lodash2.default.find(this.props.columns, { dataKey: params.sortBy });
                if (column && column.type) {
                    params.type = column.type;
                }
            }

            if (onSorting) {
                onSorting(params);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props3 = this.props;
            var loading = _props3.loading;
            var headerHeight = _props3.headerHeight;
            var onSorting = _props3.onSorting;
            var sorting = _props3.sorting;


            var columns = this.props.columns.map(function (column, index) {
                if (!column.width) {
                    column.width = 10;
                }

                if (!column.cellRenderer) {
                    column.cellRenderer = defaultCellRenderer;
                } else {
                    column.cellRenderer = ifEmptyCellDecorator(column.cellRenderer);
                }

                return _react2.default.createElement(_reactVirtualized.FlexColumn, _extends({ key: index }, column));
            });

            return _react2.default.createElement(
                _reactVirtualized.AutoSizer,
                null,
                function (_ref4) {
                    var width = _ref4.width;
                    var height = _ref4.height;
                    return _react2.default.createElement(
                        'div',
                        { style: { width: width, height: height } },
                        _react2.default.createElement(GridLoadingShade, { visible: loading, width: width, height: height,
                            marginTop: headerHeight }),
                        _react2.default.createElement(
                            _reactVirtualized.FlexTable,
                            _extends({}, _this2.props, {

                                rowGetter: _this2._rowGetter.bind(_this2),
                                rowCount: _this2.props.dataSource.length,
                                rowClassName: _this2._rowClassName.bind(_this2),

                                height: height,
                                width: width,
                                tabIndex: null,

                                onRowClick: _this2._rowClickHandler.bind(_this2),
                                rowRenderer: customRowRenderer,
                                noRowsRenderer: noRowsRenderer,

                                sort: _this2.handleSort.bind(_this2),
                                sortBy: sorting && sorting.sortBy,
                                sortDirection: sorting && sorting.sortDirection }),
                            columns
                        )
                    );
                }
            );
        }
    }]);

    return Grid;
}(_react.Component);

Grid.propTypes = {
    dataSource: _react.PropTypes.array.isRequired,
    columns: _react.PropTypes.array.isRequired,

    idProperty: _react.PropTypes.string,
    headerHeight: _react.PropTypes.number,
    rowHeight: _react.PropTypes.number,
    overscanRowCount: _react.PropTypes.number,
    rowClassName: _react.PropTypes.func,
    onRowClick: _react.PropTypes.func,
    loading: _react.PropTypes.bool,

    selection: _react.PropTypes.oneOfType([_react.PropTypes.object, _react.PropTypes.number]),
    onSelection: _react.PropTypes.func,

    sorting: _react.PropTypes.object,
    onSorting: _react.PropTypes.func
};

Grid.defaultProps = {
    idProperty: 'id',
    headerHeight: 23,
    rowHeight: 25,
    overscanRowCount: 10
};

Grid.unstable_handleError = function (e) {
    return console.error(e);
};

function customRowRenderer(_ref5) {
    var className = _ref5.className;
    var columns = _ref5.columns;
    var index = _ref5.index;
    var isScrolling = _ref5.isScrolling;
    var onRowClick = _ref5.onRowClick;
    var onRowDoubleClick = _ref5.onRowDoubleClick;
    var onRowMouseOver = _ref5.onRowMouseOver;
    var onRowMouseOut = _ref5.onRowMouseOut;
    var rowData = _ref5.rowData;
    var style = _ref5.style;


    var props = {};
    if (onRowClick || onRowDoubleClick || onRowMouseOver || onRowMouseOut) {
        props['aria-label'] = 'row';
        props.role = 'row';

        if (onRowClick) {
            props.onClick = function (event) {
                return onRowClick({ index: index, event: event });
            };
        }
        if (onRowDoubleClick) {
            props.onDoubleClick = function (event) {
                return onRowDoubleClick({ index: index, event: event });
            };
        }
        if (onRowMouseOut) {
            props.onMouseOut = function (event) {
                return onRowMouseOut({ index: index, event: event });
            };
        }
        if (onRowMouseOver) {
            props.onMouseOver = function (event) {
                return onRowMouseOver({ index: index, event: event });
            };
        }
    }

    return _react2.default.createElement(
        'div',
        _extends({}, props, {
            className: className,
            style: style
        }),
        columns
    );
}

function noRowsRenderer() {
    return _react2.default.createElement(
        'div',
        { className: 'empty' },
        'Нет записей'
    );
}

function defaultCellRenderer(_ref6) {
    var cellData = _ref6.cellData;

    if (cellData == null || cellData == '') {
        return ' ';
    } else {
        return String(cellData);
    }
}

function ifEmptyCellDecorator(callback) {
    return function (params) {
        var text = callback(params);
        if (text == null || String(text).trim() === '') {
            return ' ';
        }
        return text;
    };
}

exports.default = Grid;