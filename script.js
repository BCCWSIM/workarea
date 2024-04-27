window.onbeforeunload = () => window.scrollTo(0, 0);
window.onload = toggleView;

let items = [];
let sortDirection = [];
let selectedItems = new Set();
let isTableView = true;

document.getElementById('toggleViewButton').addEventListener('click', toggleView);
document.getElementById('clearSelectionButton').addEventListener('click', clearSelection);
document.getElementById('reviewButton').addEventListener('click', reviewSelection);

fetch('Resources.csv')
    .then(response => response.text())
    .then(csvData => {
        items = csvData.split('\n').map(row => row.split(','));
        sortDirection = new Array(items[0].length).fill(1);
        displayTable(items);
    })
    .catch(error => console.error('Error fetching CSV:', error));

// Tabbed Menu
function openMenu(evt, menuName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("menu");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-dark-grey", "");
  }
  document.getElementById(menuName).style.display = "block";
  evt.currentTarget.firstElementChild.className += " w3-dark-grey";
}
document.getElementById("myLink").click();

function displayTable(data) {
    const table = document.getElementById('csvTable');
    table.innerHTML = '';

    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); 
    // Add an empty header for the checkbox column
    data[0].forEach((cell, index) => {
        const th = document.createElement('th');
        th.classList.add('header');
        th.style.textAlign = 'right'; // Align content to the right
        th.addEventListener('click', () => sortData(index)); // Attach event listener to the entire header cell
        const span = document.createElement('span');
        span.textContent = cell;
        th.appendChild(span);
        const arrow = document.createElement('span');
        arrow.textContent = ' ↑↓';
        arrow.classList.add('arrow');
        th.appendChild(arrow);
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = 1; i < data.length; i++) {
        const dataRow = document.createElement('tr');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('row-checkbox');
        checkbox.checked = selectedItems.has(data[i].join(','));
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                dataRow.classList.add('selected');
                selectedItems.add(data[i].join(','));
            } else {
                dataRow.classList.remove('selected');
                selectedItems.delete(data[i].join(','));
            }
            updateClearSelectionButton();
        });
        const checkboxCell = document.createElement('td');
        checkboxCell.appendChild(checkbox);
        dataRow.appendChild(checkboxCell);
        data[i].forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            if (cellIndex === 0) {
                const img = document.createElement('img');
                img.src = cell;
                img.alt = 'Thumbnail';
                img.classList.add('thumbnail');
                td.appendChild(img);
            } else {
                td.textContent = cell;
            }
            dataRow.appendChild(td);
        });
        if (selectedItems.has(data[i].join(','))) {
            dataRow.classList.add('selected');
        }
        table.appendChild(dataRow);
    }
}

function sortData(columnIndex) {
    const dataToSort = items.slice(1); 
    // Exclude the header row from sorting
    dataToSort.sort((a, b) => {
        const aValue = isNaN(Date.parse(a[columnIndex])) ? a[columnIndex] : new Date(a[columnIndex]);
        const bValue = isNaN(Date.parse(b[columnIndex])) ? b[columnIndex] : new Date(b[columnIndex]);
        if (typeof aValue === 'string') {
            return sortDirection[columnIndex] * aValue.localeCompare(bValue);
        } else {
            return sortDirection[columnIndex] * (aValue - bValue);
        }
    });
    sortDirection[columnIndex] *= -1;
    items = [items[0], ...dataToSort]; 
    // Add the header row back after sorting
    displayTable(items);
}

function reviewSelection() {
    const selectedData = [items[0]]; // include headers
    for (let i = 1; i < items.length; i++) {
        if (selectedItems.has(items[i].join(','))) {
            selectedData.push(items[i]);
        }
    }
    if (isTableView) {
        displayTable(selectedData);
    } else {
        displayGallery(selectedData);
    }
}

function clearSelection() {
    selectedItems.clear();
    if (isTableView) {
        displayTable(items);
    } else {
        displayGallery(items);
    }
    updateClearSelectionButton();
}

function updateGalleryView() {
    if (!isTableView) {
        displayGallery(items);
    }
}


function updateClearSelectionButton() {
    const clearSelectionButton = document.getElementById('clearSelectionButton');
    clearSelectionButton.innerHTML = `CLEAR<br>SELECTION (${selectedItems.size})`;
    if (selectedItems.size > 0) {
        clearSelectionButton.classList.add('amber');
    } else {
        clearSelectionButton.classList.remove('amber');
    }
}


function displayTable(data) {
    const table = document.getElementById('csvTable');
    table.innerHTML = '';

    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); 
    
    // Add an empty header for the checkbox column
    data[0].forEach((cell, index) => {
        const th = document.createElement('th');
        th.classList.add('header');
        const span = document.createElement('span');
        span.textContent = cell;
        th.appendChild(span);
        const arrow = document.createElement('span');
        arrow.textContent = ' ↑↓';
        arrow.classList.add('arrow');
        arrow.addEventListener('click', () => sortData(index));
        th.appendChild(arrow);
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = 1; i < data.length; i++) {
        const dataRow = document.createElement('tr');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('row-checkbox');
        checkbox.checked = selectedItems.has(data[i].join(','));
        const checkboxCell = document.createElement('td');
        checkboxCell.appendChild(checkbox);
        dataRow.appendChild(checkboxCell);
        data[i].forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            if (cellIndex === 0) {
                const img = document.createElement('img');
                img.src = cell;
                img.alt = 'Thumbnail';
                img.classList.add('thumbnail');
                td.appendChild(img);
            } else {
                td.textContent = cell;
            }
            dataRow.appendChild(td);
        });
        if (selectedItems.has(data[i].join(','))) {
            dataRow.classList.add('selected');
        }
        table.appendChild(dataRow);

        // Add click event to the row
        dataRow.addEventListener('click', (event) => {
            if (event.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    dataRow.classList.add('selected');
                    selectedItems.add(data[i].join(','));
                } else {
                    dataRow.classList.remove('selected');
                    selectedItems.delete(data[i].join(','));
                }
                updateClearSelectionButton();
            }
        });
    }
}

function toggleView() {
    isTableView = !isTableView;
    if (isTableView) {
        document.getElementById('csvTable').style.display = '';
        document.getElementById('csvGallery').style.display = 'none';
        displayTable(items);
    } else {
        document.getElementById('csvTable').style.display = 'none';
        document.getElementById('csvGallery').style.display = '';
        displayGallery(items);
    }
}

function displayGallery(data) {
    const gallery = document.getElementById('csvGallery');
    gallery.innerHTML = '';

    for (let i = 1; i < data.length; i++) {
        const div = document.createElement('div');
        div.classList.add('card');

        // Check if the item is selected
        const itemKey = data[i].join(',');
        if (selectedItems.has(itemKey)) {
            div.classList.add('selected'); // Add the 'selected' class
        }

        // Add a click event listener to the card
        div.addEventListener('click', function() {
            if (selectedItems.has(itemKey)) {
                selectedItems.delete(itemKey);
                div.classList.remove('selected'); // Remove the 'selected' class
            } else {
                selectedItems.add(itemKey);
                div.classList.add('selected'); // Add the 'selected' class
            }
            updateClearSelectionButton();
        });

        const contentDiv = document.createElement('div'); // Create a new div for the content
        data[i].forEach((cell, cellIndex) => {
            const p = document.createElement('p');
            const span = document.createElement('span');
            span.style.fontWeight = 'bold'; // Make the header label bold

            // Display the header label and the cell data based on the column
            if (data[0][cellIndex] === 'Title') {
                p.textContent = cell; // Display only the cell data
            } else if (data[0][cellIndex] === 'SKU' || data[0][cellIndex] === 'ID') {
                span.textContent = data[0][cellIndex] + ': '; // Display the header label
                p.appendChild(span);
                p.appendChild(document.createTextNode(cell)); // Display the cell data
            } else if (data[0][cellIndex] === 'Quantity') {
                p.textContent = cell; // Display only the cell data
                p.style.fontSize = '1.5em'; // Format the cell data
            }

            if (cellIndex === 0) {
                const img = document.createElement('img');
                img.src = cell;
                img.alt = 'Thumbnail';
                img.classList.add('thumbnail');
                contentDiv.appendChild(img);
            } else {
                contentDiv.appendChild(p);
            }
        });
        div.appendChild(contentDiv); // Append the content div to the card div
        gallery.appendChild(div);
    }
}

document.getElementById('printPdf').addEventListener('click', function() {
    var csvTable = document.getElementById('csvTable');
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.text('CSV Table', 40, 30);
    pdf.autoTable({html: '#csvTable', startY: 50});
    window.open(URL.createObjectURL(pdf.output("blob")));
});

