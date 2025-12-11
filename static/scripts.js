
let currentCollectionLi = null;
let currentCollectionId = null; // Track the currently selected collection's ID

function showForm() {
    // Remove empty messages and show form
    document.getElementById("main-empty-message").style.display = "none";
    document.getElementById("sidebar-empty-message").style.display = "none";
    document.getElementById("collection-form").style.display = "flex";
    document.getElementById("collection-form-extras").style.display = "flex";
    document.getElementById("stats").style.display = "flex";
    document.getElementById("items").style.display = "flex";
}

function clearForm() {
    document.getElementById('collection-name').value = '';
    document.getElementById('collection-description').value = '';
    document.getElementById('collection-category').value = '';
    document.getElementById('collection-color').value = '#000000';
}

function fillSidebar() {
    // Remove any unsaved empty collection boxes
    removeEmptyCollections();
    
    showForm();
    clearForm();

    // Create a temporary li for live preview while typing
    const li = document.createElement('li');
    li.textContent = '';
    li.classList.add('empty-collection');
    document.getElementById('collection-list').appendChild(li);
    currentCollectionLi = li;
    currentCollectionId = null; // This is a new collection, no ID yet
    
    // Clear items list and reset stats for new collection
    document.getElementById('item-list').innerHTML = '';
    document.getElementById('total-items').textContent = 'Total Items: 0';
    document.getElementById('total-value').textContent = 'Total Value: £0.00';
}

function removeEmptyCollections() {
    // Remove any <li> elements that have no data-id (unsaved collections)
    const allItems = document.querySelectorAll('#collection-list li');
    allItems.forEach(item => {
        if (!item.dataset.id) {
            item.remove();
        }
    });
}

function selectCollection(collectionId, name, description, category) {
    // Remove any unsaved empty collection boxes when selecting a different collection
    removeEmptyCollections();
    
    showForm();

    // Fill in the form with the collection's details
    document.getElementById('collection-name').value = name || '';
    document.getElementById('collection-description').value = description || '';
    document.getElementById('collection-category').value = category || '';

    // Track the selected collection
    currentCollectionId = collectionId;

    // Highlight the selected item in the sidebar
    const allItems = document.querySelectorAll('#collection-list li');
    allItems.forEach(item => item.classList.remove('selected'));
    const selectedItem = document.querySelector(`#collection-list li[data-id="${collectionId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        currentCollectionLi = selectedItem;
    }

    // Load items for this collection
    loadItems(collectionId);
}

document.getElementById("add-collection-btn").addEventListener('click', fillSidebar);
document.getElementById("add-collection-btn-main").addEventListener('click', fillSidebar);
document.getElementById("add-item-btn").addEventListener('click', () => {
    document.getElementById("item-form").style.display = "flex";
});
document.getElementById("close-item-form-btn").addEventListener('click', closeItemForm);

document.getElementById("clear-data").addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all collections and items? This cannot be undone.')) {
        fetch('http://127.0.0.1:5000/clear-all', {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(() => {
            // Reset the UI
            currentCollectionId = null;
            currentCollectionLi = null;
            loadCollections();
            document.getElementById('item-list').innerHTML = '';
            document.getElementById('total-items').textContent = 'Total Items: 0';
            document.getElementById('total-value').textContent = 'Total Value: £0.00';
            document.getElementById('collection-form').style.display = 'none';
            document.getElementById('collection-form-extras').style.display = 'none';
            document.getElementById('stats').style.display = 'none';
            document.getElementById('items').style.display = 'none';
            document.getElementById('main-empty-message').style.display = 'block';
            document.getElementById('sidebar-empty-message').style.display = 'block';
        });
    }
});

document.getElementById("collection-name").addEventListener('input', (e) => {
    if (currentCollectionLi) {
        currentCollectionLi.textContent = e.target.value;
    }
});

function loadCollections() {
    fetch('http://127.0.0.1:5000/collections')
        .then(response => response.json())
        .then(collections => {
            const list = document.getElementById('collection-list');
            list.innerHTML = ''; // Clear existing

            if (collections.length === 0) {
                document.getElementById('sidebar-empty-message').style.display = 'block';
                document.getElementById('main-empty-message').style.display = 'block';
            } else {
                document.getElementById('sidebar-empty-message').style.display = 'none';
                document.getElementById('main-empty-message').style.display = 'none';
            }

            collections.forEach(col => {
                const li = document.createElement('li');
                li.textContent = col[1]; // col[1] is the name
                li.dataset.id = col[0]; // col[0] is the collection_id
                li.dataset.description = col[2] || '';
                li.dataset.category = col[3] || '';

                // Add click event to select this collection
                li.addEventListener('click', () => {
                    selectCollection(col[0], col[1], col[2], col[3]);
                });

                list.appendChild(li);
            });

            // Auto-select the first collection if there are any and none is currently selected
            if (collections.length > 0 && !currentCollectionId) {
                const firstCol = collections[0];
                selectCollection(firstCol[0], firstCol[1], firstCol[2], firstCol[3]);
            }
        });
}

window.addEventListener('DOMContentLoaded', loadCollections);

function addCollection(name, description, category) {
    fetch('http://127.0.0.1:5000/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category })
    })
    .then(res => res.json())
    .then(data => {
        // Set the current collection ID so subsequent changes update instead of insert
        currentCollectionId = data.collection_id;
        if (currentCollectionLi) {
            currentCollectionLi.dataset.id = data.collection_id;
        }
        loadCollections();
    });
}

function updateCollection(id, name, description, category) {
    fetch(`http://127.0.0.1:5000/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category })
    })
    .then(res => res.json())
    .then(() => loadCollections());
}

['collection-name', 'collection-description', 'collection-category'].forEach(id => {
    document.getElementById(id).addEventListener('change', function() {
        const name = document.getElementById('collection-name').value;
        const description = document.getElementById('collection-description').value;
        const category = document.getElementById('collection-category').value;
        if (name) {
            if (currentCollectionId) {
                // Update existing collection
                updateCollection(currentCollectionId, name, description, category);
            } else {
                // Add new collection
                addCollection(name, description, category);
            }
        }
    });
});

// ==================== ITEMS ====================

function loadItems(collectionId) {
    if (!collectionId) {
        document.getElementById('item-list').innerHTML = '';
        return;
    }

    fetch(`http://127.0.0.1:5000/collections/${collectionId}/items`)
        .then(response => response.json())
        .then(items => {
            const list = document.getElementById('item-list');
            list.innerHTML = ''; // Clear existing

            items.forEach(item => {
                // item = [item_id, name, set_name, status, quantity, date_acquired, value]
                const li = document.createElement('li');
                li.dataset.id = item[0];
                li.innerHTML = `
                    <span class="item-name">${item[1]}</span>
                    <span class="item-set">${item[2] || ''}</span>
                    <span class="item-status">${item[3]}</span>
                    <span class="item-quantity">x${item[4]}</span>
                    <span class="item-value">£${parseFloat(item[6]).toFixed(2)}</span>
                `;
                list.appendChild(li);
            });

            // Update stats
            updateStats(items);
        });
}

function updateStats(items) {
    const totalItems = items.reduce((sum, item) => sum + item[4], 0); // quantity
    const totalValue = items.reduce((sum, item) => sum + (item[4] * item[6]), 0); // quantity * value
    document.getElementById('total-items').textContent = `Total Items: ${totalItems}`;
    document.getElementById('total-value').textContent = `Total Value: £${totalValue.toFixed(2)}`;
}

function addItem(collectionId, name, setName, status, quantity, dateAcquired, value) {
    fetch(`http://127.0.0.1:5000/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            set_name: setName,
            status,
            quantity: parseInt(quantity) || 1,
            date_acquired: dateAcquired || null,
            value: parseFloat(value) || 0.0
        })
    })
    .then(res => res.json())
    .then(() => {
        loadItems(collectionId);
        closeItemForm();
    });
}

function closeItemForm() {
    document.getElementById('item-form').style.display = 'none';
    // Clear form
    document.getElementById('item-name').value = '';
    document.getElementById('item-set').value = '';
    document.getElementById('item-status').value = 'Owned';
    document.getElementById('item-quantity').value = '';
    document.getElementById('item-value').value = '';
    document.getElementById('item-acquired-date').value = '';
    document.getElementById('item-notes').value = '';
}

// Handle item form submission
document.getElementById('item-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!currentCollectionId) {
        alert('Please select or create a collection first.');
        return;
    }

    const name = document.getElementById('item-name').value;
    const setName = document.getElementById('item-set').value;
    const status = document.getElementById('item-status').value;
    const quantity = document.getElementById('item-quantity').value || 1;
    const value = document.getElementById('item-value').value || 0;
    const dateAcquired = document.getElementById('item-acquired-date').value;

    if (name) {
        addItem(currentCollectionId, name, setName, status, quantity, dateAcquired, value);
    }
});