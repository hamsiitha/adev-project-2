function filterVendingMachines() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const tableRows = document.querySelectorAll("#vending-machines-table tbody tr");
  
    tableRows.forEach(row => {
      const id = row.cells[0].textContent.toLowerCase(); // ID column
      const school = row.cells[1].textContent.toLowerCase(); // School column
  
      // Check if the query matches either ID or School
      if (id.includes(query) || school.includes(query)) {
        row.style.display = ""; // Show the row
      } else {
        row.style.display = "none"; // Hide the row
      }
    });
  }
  
  


fetch("/vending_machine", {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error("Error occurred: " + response.statusText);
    }
    return response.json(); // Parse the response as JSON
})
.then(data => {
    console.log(data);
    
    // Iterate over vending machines
    data.vending_machines.forEach(vm => {
        const template = document.getElementById("vending_machine_row");
        var clone = document.importNode(template.content, true).querySelector("tr");
        
        // Find corresponding location information
        const location = data.locations.find(loc => loc.location_id === vm.location_id);
        
        if (location) {
            // populating location information
            clone.querySelector("td:nth-of-type(2)").textContent = location.school;
            clone.querySelector("td:nth-of-type(3)").textContent = location.block;
            clone.querySelector("td:nth-of-type(4)").textContent = location.floor;
        }

        // populating vendor name and status
        clone.querySelector("td:nth-of-type(1)").textContent = vm.vending_machine_id;
        clone.querySelector("td:nth-of-type(5)").textContent = vm.vendor_name;
        clone.querySelector("td:nth-of-type(6)").textContent = vm.status_id === 1 ? "Inactive" : "Active";
        
        // Payment methods
        const paymentMethods = data.payment_method
            .filter(method => method.vending_id === vm.vending_machine_id)
            .map(method => method.payment_name);

        // Display payment methods
        clone.querySelector("td:nth-of-type(7)").textContent = paymentMethods.join(", ");

        // Append the populated row to the table
        document.querySelector("tbody").appendChild(clone)
    });
})
.catch(err => {
    console.error("Error fetching vending machines data:", err);
});


  document.getElementById('vendor-form').addEventListener('submit', event => {
    event.preventDefault();
    //const id = document.getElementById('delete-item-id').value;
  
    const form = document.getElementById("vendor-form");
    const formData = new FormData(form);
    alert("helllo4");
    //const location = req.body["location"];

  for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }

form.addEventListener("Submit", (e) => {
    e.preventDefault();

    const vendingMachineData = {
        school: form.school.value,
        block:form.block.value,
        floor:form.floor.value,
        vendor_name:form.vendor_name.value,
        status: form.status.value
    };


     fetch(`/add_vendor`,{
       method: 'POST',
       headers: {
        "Content-Type": "application/json"
       },
       body: JSON.stringify(vendingMachineData)
     })
     .then(response => {
        if(!response.ok) {
            return response.json().then(error =>{
                console.error(error);
                throw new Error(error.error ||'Unknown error');
            }); 
        }

        return response.json();
    })
    .then(data => {
        if (data.added) {
            alert("Vending Machine added successfully");
            MediaSourceHandle.style.display = "none";
            location.reload();

        }
    })
    .catch(err => console.error("Error:", err));
        

    // Make the fetch request to delete the item
//     fetch(`/add_vendor`,{
//       method: 'POST',
//       body: formData,
//     })
//     .then(response => {
//       alert("helllo2")
//       if (!response.ok) {
//         return response.text().then(error => {
//           throw new Error("Error occurred: " + error);
//         })
//       }
//       return response.json(); // Parse the response as JSON
//     })
//     .then(data => {
//       alert(data.message);
//       location.reload() // Reload the page to remove the deleted item from the list
//       alert("helllo3")
//     })
//     .catch(err => console.error('Error Adding item:', err));
     });
  
    })
