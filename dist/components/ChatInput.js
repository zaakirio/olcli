import React from 'react';
import { Box, Text, useInput } from 'ink';
export const ChatInput = ({ value, onChange, onSubmit, placeholder = '', focused = true, }) => {
    useInput((input, key) => {
        if (!focused)
            return;
        if (key.return) {
            onSubmit(value);
        }
        else if (key.backspace || key.delete) {
            onChange(value.slice(0, -1));
        }
        else if (key.ctrl && input === 'c') {
            // Let the parent handle Ctrl+C
            return;
        }
        else if (input && !key.ctrl && !key.meta) {
            onChange(value + input);
        }
    }, { isActive: focused });
    return (React.createElement(Box, null,
        React.createElement(Text, { color: "green", bold: true },
            ">",
            ' '),
        React.createElement(Text, null, value || (focused ? '' : placeholder)),
        focused && (React.createElement(Text, { color: "green" }, "\u258B"))));
};
//# sourceMappingURL=ChatInput.js.map