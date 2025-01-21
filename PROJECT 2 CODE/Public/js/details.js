// Fetch items from the API and display them in the grid
fetch('/vending_machine/item', {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
})
  .then(response => {
    // Check if the response is successful
    if (!response.ok) {
      return response.text().then(error => error)
      throw new Error("Error occurred: " + response.statusText);
    }
    return response.json(); // Parse the response as JSON
  })
  .then(data => {
    console.log(data)

    const itemsGrid = document.getElementById('items-grid');
    const template = document.getElementById('item-template');

    // Clear the grid
    itemsGrid.innerHTML = '';

    // Loop through each item and display it in the grid
    data.forEach(item => {
      const clone = document.importNode(template.content, true);
      const quantityElement = clone.querySelector('.item-quantity');
      clone.querySelector('.item-id').textContent = item.id; 
      clone.querySelector(".item-image").src = `/${item.image}`;      
      clone.querySelector('.item-name').textContent = item.name;
      clone.querySelector('.item-cost').textContent = item.cost;
      console.log(quantityElement); // This should not be null
      console.log(item.quantity)  

      if (quantityElement != null) {
         quantityElement.textContent = item.quantity;
         console.log('iamhere')
         console.log(quantityElement.textContent); 
        }
      //clone.querySelector('.item-quantity').textContent = item.quantity;
      clone.querySelector('.availability').textContent = item.availability;
      

      itemsGrid.appendChild(clone);  // Append the item card to the grid
    });
  })
  .catch(err => console.error('Error fetching items:', err));

// Handle form submission for adding/updating items
/* document.getElementById('delete-form').addEventListener('submit', event => {
  event.preventDefault();

  const id = document.getElementById('item-id').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/vending_machine/item/${id}` : '/vending_machine/item';  // Updated to include correct endpoint

  // Prepare item data
  const itemData = {
    name: document.getElementById('item-name').value,
    cost: parseFloat(document.getElementById('item-cost').value),
    quantity: parseInt(document.getElementById('item-quantity').value),
    availability: document.getElementById('item-availability').value === '1',
    image: document.getElementById('item-image').value,  // You might need to handle image upload separately
  };

  // Make the fetch request to add or update the item
  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error occurred: " + response.statusText);
    }
    return response.json(); // Parse the response as JSON
  })
  .then(data => {
    alert(data.message);
    location.reload();  // Reload the page to refresh the items list
  })
  .catch(err => console.error('Error submitting form:', err));
}); */

// Handle deletion of an item
document.getElementById('item-form').addEventListener('submit', event => {
  event.preventDefault();
  const id = document.getElementById('delete-item-id').value;

  const form = document.getElementById("item-form");
  const formData = new FormData(form);

  // Make the fetch request to delete the item
  fetch(`/add_item`, {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    alert("helllo2")
    if (!response.ok) {
      return response.text().then(error => {
        throw new Error("Error occurred: " + error);
      })
    }
    return response.json(); // Parse the response as JSON
  })
  .then(data => {
    alert(data.message);
    location.reload();  // Reload the page to remove the deleted item from the list
    alert("helllo3")
  })
  .catch(err => console.error('Error deleting item:', err));
});

// Handle form submission for deleting items
document.getElementById('delete-form').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent default form submission

  const itemId = document.getElementById('delete-item-id').value;

  fetch('/delete_item', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ itemId: itemId }),  // Send itemId in the body
  })
    .then(response => {
      
      if (!response.ok) {
        throw new Error('Error occurred: ' + response.statusText);
        }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      alert('Item deleted successfully');
      location.reload(); // Reload the page to reflect the changes
    })
    .catch(error => {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    });
});


