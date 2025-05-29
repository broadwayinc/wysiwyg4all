// plugin example: create a table with editable cells

function createTable(rows, cols) {
  let tableState = {
    tableWrap: null,
    table: null,
    tbody: null,
    mergeBtn: null,
    unmergeBtn: null,
    isResizing: false,
    isDragging: false,
    isSelection: false,
    isMouseDown: false,
    selectionStart: null,
    outlinePosition: {
      top: 0,
      left: 0,
      width: 0,
      height: 0
    }
  };

  const wyswrap = document.querySelector('.wysiwyg-wrap');
  const wyswrapWidth = wyswrap.offsetWidth;

  // 전체 테이블 컨테이너 생성
  const tableWrap = document.createElement('div');

  tableWrap.className = 'wysiwyg-table-wrap';
  //   tableWrap.setAttribute('contenteditable', 'false');
  tableWrap.style.setProperty('--wysiwyg-table-max-width', `calc(${wyswrapWidth}px - 2rem + 30px)`);

  // 테이블 요소 생성
  const table = document.createElement('table');
  table.className = 'wysiwyg-table';
  //   table.setAttribute('contenteditable', 'false');

  const tbody = document.createElement('tbody');

  const style = document.createElement('style');
  style.textContent = `
    body {
        --merge-btn-top: 0px;
        --merge-btn-left: 0px;
    }
  `;

  for (let r = 0; r < rows; r++) {
    const row = document.createElement('tr');

    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('td');
      //   cell.contentEditable = 'true';
      cell.innerHTML = '&nbsp;';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.setAttribute('contenteditable', 'true');

      addResizer(tableState, cell);
      bindCellEvents(tableState, cell);

      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  tableWrap.appendChild(table);

  tableState.tableWrap = tableWrap;
  tableState.table = table;
  tableState.tbody = tbody;

  document.addEventListener('mouseup', () => {
    tableState.mergeBtn?.classList.remove('active');

    if (tableState.isDragging) {
      const selected = tableState.table.querySelectorAll('td.dragged-cell');
      if (selected.length >= 2) {
        tableState.mergeBtn?.classList.add('active');
      }
    }

    tableState.isMouseDown = false;
    tableState.isDragging = false;
    tableState.isSelection = false;

    tableSelection(tableState); // dragging 클래스 제거
  });

  document.addEventListener('click', (e) => {
    if (tableState.table && !tableState.table.contains(e.target)) {
      if (e.target.closest('.btn-custom')) {
        return;
      }
      tableState.isSelection = false;
      clearSelection(tableState.table);
      tableSelection(tableState);
    }
  });

  initButtons(tableState);

  return tableWrap;
}
