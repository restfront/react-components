import React, { PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

const SEPARATOR = ':';

class TimeEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: formatTime(props.value)
        };
        this.previousText = this.state.text;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value === this.props.value) {
            return;
        }

        const currentTime = parseTime(this.state.text);
        const currentTimeStr = formatTime(currentTime),
            newStr = formatTime(nextProps.value);
        if (currentTimeStr !== newStr) {
            this.setState({text: newStr});
        }
    }

    render() {
        const styles = Object.assign({textAlign: 'center'}, this.props.style || {}, {width: this.props.width});

        return (
            <input
                type="text"
                style={ styles }
                className={ this.props.className }
                disabled={ this.props.disabled }

                value={ this.state.text || '' }

                onChange={ this.handleChange.bind(this) }
                onWheel={ this.handleWheel.bind(this) }
                onBlur={ this.handleBlur.bind(this) }
                />
        );
    }

    handleChange(e) {
        let newText = (e.target.value || '').trim();
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
        this.setState({text: newText}, () => {
            // Пробуем считать время
            const time = parseTime(newText);
            if (time) {
                this.props.onChange(time);
            } else {
                this.props.onChange(null);
            }
        });
    }

    handleBlur(e) {
        const text = e.target.value;
        const time = parseTime(text);

        if (time) {
            this.setState({text: formatTime(time)});
        }
    }

    handleWheel(event) {
        if (!event || !event.deltaY) return;
        if (!this.props.value) return;

        const oldValue = this.props.value;
        const change = event.deltaY > 0 ? -1 : 1;

        const newValue = new Date();
        if (isMouseInLeftHalf(this.props.width, event.nativeEvent)) {
            newValue.setHours(oldValue.getHours() + change, oldValue.getMinutes());
        } else {
            newValue.setHours(oldValue.getHours(), oldValue.getMinutes() + change);
        }
        this.props.onChange(newValue);
    }
}

TimeEdit.propTypes = {
    value: PropTypes.instanceOf(Date),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired
};

function isValidInput(text) {
    if (!text) {
        return true;
    }

    const letters = text.split(SEPARATOR).join('').split('');

    // Проверяем каждый символ
    for (let i = 0, length = letters.length; i < length; i++) {
        if (!(letters[i] === SEPARATOR || isFinite(letters[i]))) {
            return false;
        }
    }

    const timeParts = text.indexOf(SEPARATOR) ? text.split(SEPARATOR) : [text];

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
    const timeParts = text.split(SEPARATOR);

    // Переводим части времени с числа
    const hours = +timeParts[0],
        minutes = +timeParts[1];

    // Возвращаем время
    const value = new Date();
    value.setHours(hours);
    value.setMinutes(minutes);
    return value;
}

function isMouseInLeftHalf(width, mouseEvent) {
    const mouseX = mouseEvent && mouseEvent.offsetX;
    return (mouseX / width) < 0.5;
}

function formatTime(time) {
    if (!time) {
        return '';
    }

    const
        hoursStr = padLeft('00', time.getHours()),
        minutesStr = padLeft('00', time.getMinutes());
    return `${hoursStr}${SEPARATOR}${minutesStr}`;
}

function padLeft(mask, value) {
    return String(mask + value).slice(-mask.length);
}

export default TimeEdit;