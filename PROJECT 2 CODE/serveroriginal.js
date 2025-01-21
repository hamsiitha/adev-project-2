const express = require('express');
const multer = require('multer'); // Import multer for file uploads
const path = require('path');
const connection = require('./db-connection');

const app = express();

app.use(express.static("Public"));
app.use(express.json());
app.use('/', express.static('uploads')); // Serve uploaded files

app.use(express.static('Public')); // Serve files from the "Public" folder
app.use('/image_uploads', express.static('Public/image_uploads'));



// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Save files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to the file name
  }
});

const upload = multer({ storage: storage });

// API Endpoint to get all vending machines with location and payment methods
/* app.get('/vending_machine', (req, res) => {
  const query = ` 
  SELECT *
    FROM vending_machine vm
    JOIN vending_payment vp ON vp.vending_id = vm.vending_machine_id
    JOIN location l ON l.location_id = vm.location_id
    JOIN payment_method ON payment_method.payment_id = vp.payment_id;
  `;*/
app.get('/vending_machine', (req, res) => {
  const query = `
      SELECT 
    vm.vending_machine_id,
    l.location_id,
    l.school,
    l.block,
    l.floor,
    vm.vendor_name,
    st.status_id,
    st.status_name,
    GROUP_CONCAT(pm.payment_name SEPARATOR ', ') AS payment_methods
FROM vending_machine vm
JOIN vending_payment vp ON vp.vending_id = vm.vending_machine_id 
JOIN location l ON l.location_id = vm.location_id
JOIN payment_method pm  ON pm.payment_id = vp.payment_id
JOIN status st ON st.status_id = vm.status_id
GROUP BY vm.vending_machine_id;`

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // Process the results and format it for the frontend
    let vending_machines = [];
    let locations = [];
    let payment_methods = [];

    results.forEach(row => {
      // Handle vending machines
      if (!vending_machines.some(vm => vm.vending_machine_id === row.vending_machine_id)) {
        vending_machines.push({
          vending_machine_id: row.vending_machine_id,
          vendor_name: row.vendor_name,
          status_id: row.status_id
        });
      }

      // Handle locations
      if (!locations.some(loc => loc.location_id === row.location_id)) {
        locations.push({
          location_id: row.location_id,
          school: row.school,
          block: row.block,
          floor: row.floor
        });
      }

      // Handle payment methods
      payment_methods.push({
        vending_id: row.vending_machine_id,
        payment_name: row.payment_name
      });
    });

    // Send back the structured data
    res.json({
      vending_machines: vending_machines,
      locations: locations,
      payment_method: payment_methods
    });
  });
});

/////////////////////////////


// API Endpoint to get vending machine items
app.get('/vending_machine/item', (req, res) => {  // **Standalone Route**
  const query = `
    SELECT
      item_id,
      item_name,
      item_cost,
      item_image,
      availability,
      item_quantity
    FROM item;
  `;

  console.log('Executing query:', query); // Debugging line

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching vending machine items:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    console.log('Query results:', results); // Debugging line

    const items = results.map(row => ({
      id: row.item_id,
      name: row.item_name,
      cost: `$${(Number(row.item_cost) || 0).toFixed(2)}`, // Ensure it's a number and format cost
      image: row.item_image || 'placeholder.png', // Default image if none provided
      quantity: row.item_quantity,
      availability: row.availability ? 'Available' : 'Out of Stock' // Human-readable availability
    }));

    res.json(items); // Respond with the fetched items data
  });
});


//////////////

// Start the server  
app.listen(8081, () => {
  console.log(`Server running at http://127.0.0.1:8081`);
});
