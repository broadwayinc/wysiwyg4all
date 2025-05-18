// plugin example: create a table with editable cells

let createTable = (cols, rows) => {
    let table = document.createElement('table');
    table.setAttribute('contenteditable', 'true');
    table.style.borderCollapse = 'collapse';
    table.style.margin = '1rem 0';
    table.style.width = '100%';

    // prevent columns from being resized
    table.style.tableLayout = 'fixed';
    table.style.overflow = 'hidden';
    table.style.wordBreak = 'break-word';
    table.style.whiteSpace = 'normal';
    
    // Create initial table cells with default styling.
    for (let r = 0; r < rows; r++) {
        let tr = document.createElement('tr');
        for (let c = 0; c < cols; c++) {
            let td = document.createElement('td');
            td.innerHTML = '&nbsp;';
            td.style.minWidth = '50px';
            td.style.minHeight = '30px';
            td.style.padding = '5px';
            td.style.border = '1px solid black';
            td.style.backgroundColor = 'white';
            td.style.margin = '0';
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    // Utility methods:
    table.getRowsCount = () => table.rows.length;
    table.getColsCount = () => table.rows[0] ? table.rows[0].cells.length : 0;

    // Add a new row. Copies the cell format of the first row.
    table.addRow = () => {
        let newRow = document.createElement('tr');
        let cols = table.getColsCount();
        for (let c = 0; c < cols; c++) {
            let td = document.createElement('td');
            td.innerHTML = '&nbsp;';
            td.style.minWidth = '50px';
            td.style.minHeight = '30px';
            td.style.padding = '5px';
            td.style.border = '1px solid black';
            td.style.backgroundColor = 'white';
            td.style.margin = '0';
            newRow.appendChild(td);
        }
        table.appendChild(newRow);
    };

    // Remove a row by index.
    table.removeRow = (rowIndex) => {
        if (rowIndex >= 0 && rowIndex < table.getRowsCount()) {
            table.deleteRow(rowIndex);
        }
    };

    // Add a new column to every row.
    table.addColumn = () => {
        let rows = table.getRowsCount();
        for (let r = 0; r < rows; r++) {
            let td = document.createElement('td');
            td.innerHTML = '&nbsp;';
            td.style.minWidth = '50px';
            td.style.minHeight = '30px';
            td.style.padding = '5px';
            td.style.border = '1px solid black';
            td.style.backgroundColor = 'white';
            td.style.margin = '0';
            table.rows[r].appendChild(td);
        }
    };

    // Remove a column by index from every row.
    table.removeColumn = (colIndex) => {
        let rows = table.getRowsCount();
        for (let r = 0; r < rows; r++) {
            if (colIndex >= 0 && colIndex < table.rows[r].cells.length) {
                table.rows[r].deleteCell(colIndex);
            }
        }
    };

    // Update a specific cell's style.
    table.updateCellStyle = (rowIndex, colIndex, styleConfig) => {
        if (rowIndex >= 0 && rowIndex < table.getRowsCount()) {
            let row = table.rows[rowIndex];
            if (colIndex >= 0 && colIndex < row.cells.length) {
                let cell = row.cells[colIndex];
                if (styleConfig.backgroundColor)
                    cell.style.backgroundColor = styleConfig.backgroundColor;
                if (styleConfig.borderColor || styleConfig.borderSize || styleConfig.borderStyle) {
                    let borderSize = styleConfig.borderSize || '1px';
                    let borderStyle = styleConfig.borderStyle || 'solid';
                    let borderColor = styleConfig.borderColor || 'black';
                    cell.style.border = `${borderSize} ${borderStyle} ${borderColor}`;
                }
                if (styleConfig.padding)
                    cell.style.padding = styleConfig.padding;
                if (styleConfig.margin)
                    cell.style.margin = styleConfig.margin;
            }
        }
    };

    return table; // returns the table element with utility methods
};
