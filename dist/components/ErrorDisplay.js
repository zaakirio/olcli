import React from 'react';
import { Box, Text } from 'ink';
export const ErrorDisplay = ({ error, onDismiss }) => {
    return (React.createElement(Box, { borderStyle: "single", borderColor: "red", padding: 1, marginBottom: 1, flexDirection: "column" },
        React.createElement(Box, { marginBottom: 1 },
            React.createElement(Text, { color: "red", bold: true }, "\u274C Error")),
        React.createElement(Text, { wrap: "wrap", color: "red" }, error),
        onDismiss && (React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: "gray", dimColor: true }, "Press any key to dismiss")))));
};
//# sourceMappingURL=ErrorDisplay.js.map