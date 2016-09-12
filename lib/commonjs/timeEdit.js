'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SEPARATOR = ':';

var TimeEdit = function (_React$Component) {
    _inherits(TimeEdit, _React$Component);

    function TimeEdit(props) {
        _classCallCheck(this, TimeEdit);

        var _this = _possibleConstructorReturn(this, (TimeEdit.__proto__ || Object.getPrototypeOf(TimeEdit)).call(this, props));

        _this.state = {
            text: formatTime(props.value)
        };
        _this.previousText = _this.state.text;
        return _this;
    }

    _createClass(TimeEdit, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return (0, _reactAddonsShallowCompare2.default)(this, nextProps, nextState);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.value === this.props.value) {
                return;
            }

            var currentTime = parseTime(this.state.text);
            var currentTimeStr = formatTime(currentTime),
                newStr = formatTime(nextProps.value);
            if (currentTimeStr !== newStr) {
                this.setState({ text: newStr });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var styles = Object.assign({ textAlign: 'center' }, this.props.style || {}, { width: this.props.width });

            return _react2.default.createElement('input', {
                type: 'text',
                style: styles,
                className: this.props.className,
                disabled: this.props.disabled,

                value: this.state.text || '',

                onChange: this.handleChange.bind(this),
                onWheel: this.handleWheel.bind(this),
                onBlur: this.handleBlur.bind(this)
            });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            var _this2 = this;

            var newText = (e.target.value || '').trim();
            if (!isValidInput(newText)) {
                return false;
            }

            // Автоматически ставим разделитель
            if (newText.length === 2 && this.previousText.length !== 3 && newText.indexOf(SEPARATOR) < 0) {
                newText = newText + SEPARATOR;
            }

            // Не позволяем внести более 5 символов
            if (newText.length > 5) {
                return false;
            }

            this.previousText = newText;
            this.setState({ text: newText }, function () {
                // Пробуем считать время
                var time = parseTime(newText);
                if (time) {
                    _this2.props.onChange(time);
                } else {
                    _this2.props.onChange(null);
                }
            });
        }
    }, {
        key: 'handleBlur',
        value: function handleBlur(e) {
            var text = e.target.value;
            var time = parseTime(text);

            if (time) {
                this.setState({ text: formatTime(time) });
            }
        }
    }, {
        key: 'handleWheel',
        value: function handleWheel(event) {
            if (!event || !event.deltaY) return;
            if (!this.props.value) return;

            var oldValue = this.props.value;
            var change = event.deltaY > 0 ? -1 : 1;

            var newValue = new Date();
            if (isMouseInLeftHalf(this.props.width, event.nativeEvent)) {
                newValue.setHours(oldValue.getHours() + change, oldValue.getMinutes());
            } else {
                newValue.setHours(oldValue.getHours(), oldValue.getMinutes() + change);
            }
            this.props.onChange(newValue);
        }
    }]);

    return TimeEdit;
}(_react2.default.Component);

TimeEdit.propTypes = {
    value: _react.PropTypes.instanceOf(Date),
    width: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.number]),
    onChange: _react.PropTypes.func.isRequired
};

function isValidInput(text) {
    if (!text) {
        return true;
    }

    var letters = text.split(SEPARATOR).join('').split('');

    // Проверяем каждый символ
    for (var i = 0, length = letters.length; i < length; i++) {
        if (!(letters[i] === SEPARATOR || isFinite(letters[i]))) {
            return false;
        }
    }

    var timeParts = text.indexOf(SEPARATOR) ? text.split(SEPARATOR) : [text];

    if (timeParts.length > 2) {
        return false;
    }

    // HH
    if (timeParts[0] && timeParts[0].length && (+timeParts[0] < 0 || +timeParts[0] > 23)) {
        return false;
    }

    // mm
    if (timeParts[1] && timeParts[1].length && (+timeParts[1] < 0 || +timeParts[1] > 59)) {
        return false;
    }

    return true;
}

function parseTime(text) {
    if (!isValidInput(text) || text.indexOf(SEPARATOR) < 0) {
        return null;
    }

    // Делим текст на части
    var timeParts = text.split(SEPARATOR);

    // Переводим части времени с числа
    var hours = +timeParts[0],
        minutes = +timeParts[1];

    // Возвращаем время
    var value = new Date();
    value.setHours(hours);
    value.setMinutes(minutes);
    return value;
}

function isMouseInLeftHalf(width, mouseEvent) {
    var mouseX = mouseEvent && mouseEvent.offsetX;
    return mouseX / width < 0.5;
}

function formatTime(time) {
    if (!time) {
        return '';
    }

    var hoursStr = padLeft('00', time.getHours()),
        minutesStr = padLeft('00', time.getMinutes());
    return '' + hoursStr + SEPARATOR + minutesStr;
}

function padLeft(mask, value) {
    return String(mask + value).slice(-mask.length);
}

exports.default = TimeEdit;