const express = require('express');
const multer = require('multer'); // Import multer for file uploads
const path = require('path');
const connection = require('./db-connection');
const fs = require("fs");
const { sendWelcomeEmail } = require('./email-service');

const app = express();

// 添加 JSON 解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("Public"));
app.use(express.json());
app.use('/', express.static('uploads')); // Serve uploaded files

app.use(express.static('Public')); // Serve files from the "Public" folder

const upload = multer({ dest: 'Public/images' });
const output_folder = path.join(__dirname, "Public/images");

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
    pm.payment_name
FROM vending_machine vm
JOIN vending_payment vp ON vp.vending_id = vm.vending_machine_id 
JOIN location l ON l.location_id = vm.location_id
JOIN payment_method pm  ON pm.payment_id = vp.payment_id
JOIN status st ON st.status_id = vm.status_id;`

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    console.log('Query results Vending machine:', results); // Debugging line

    // Process the results and format it for the frontend
    let vending_machines = [];
    let locations = [];
    let payment_methods = [];

    results.forEach(row => {
      // Handle vending machines
      if (!vending_machines.some(vm => vm.vending_machine_id === row.vending_machine_id)) {
        vending_machines.push({
          vending_machine_id: row.vending_machine_id,
          location_id: row.location_id,
          school: row.school,
          block: row.block,
          floor: row.floor,
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

app.post("/add_item", upload.single("item-image"), (req, res) => {
 
  const name = req.body["item-name"];
  const cost = req.body["item-cost"];
  const quantity = req.body["item-quantity"];
  const availability = req.body["item-availability"];

  if (!name || !cost || !quantity || !availability) {
    res.status(400).json({ error: "Missing field input" });
  }

  if (!req.file) {
    res.status(400).json({ error: "Missing file input" })
  }

  console.log(req.body)
  console.log(req.file);

  const query = `
    INSERT INTO item
    VALUES (0, ?, ?, ?, ?, ?);
  `

  connection.query(query, [name, cost, `images/${name}.webp`, availability, quantity], (err, result) => {
    if (err) {
      console.error('Error inserting items:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    try {
      const output_path = path.join(output_folder, name + ".webp");
      console.log(output_path);
      fs.renameSync(req.file.path, output_path);
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: "Error in saving image" });
    }

    res.json({ message: "Item added successfully" });
  })

  // const sql = ""
})

// Delete an item
app.delete('/delete_item', (req, res) => {
  const { itemId } = req.body;  // Expecting itemId in the request body

  if (!itemId) {
    return res.status(400).json({ error: 'Item ID is required' });
  }
    
  console.log(`Before Delete Query`);
  const query = 'DELETE FROM item WHERE item_id = ?';
  console.log(`Executing query: ${query}, with itemId: ${itemId}`);

  connection.query(query, [itemId], (err, result) => {
  console.log(query);
    if (err) {
      console.error('Error deleting item:', err);
      return res.status(500).json({ error: 'Failed to delete item' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    //res.json({ message: 'Item deleted successfully' });
    res.json({ status: 'success', message: 'Item deleted successfully', deletedItemId: itemId });
  });
});



// app.post("/add_vendor", upload.none(),(req, res) => {
//   console.log("Add Vendor started");
//   const location = req.body["location"];
//   const vendor = req.body["vendor"];
//   const status = req.body["status"];
//   const paymentmethods = req.body["paymentmethods"];
//   console.log(location);
//   console.log(vendor);
//   console.log(status);
//   console.log(paymentmethods);

//  /* if (!location || !vendor || !status || !paymentmethods) {
//     res.status(400).json({ error: "Missi6ng field input" });
//   }*/

  
//   console.log(req.body);
  
//   const query = `
//     INSERT INTO vending_machine
//     VALUES (0, ?, ?, ?);
//   `

//   connection.query(query, [location, vendor,status ], (err, result) => {
//     if (err) {
//       console.error('Error inserting items:', err);
//       return res.status(500).json({ error: 'Database query failed' });
//     }

//        res.json({ message: "Vendor added successfully" });
//   })

//   // const sql = ""
// })

app.post("/add_vendor", (req, res) => {
  const { school, block, floor, vendor_name, status } = req.body;

  if (!school || !block || !floor || !vendor_name || !status ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
  }

  const sql1 = "INSERT INTO location VALUES (0, ?, ?, ?);";
  
  connection.query(sql1, [school, block, floor], (err, result) => {
      if (err) {
          res.status(500).send(err);
          return;
      }
      
      const location_id = result.insertId;
      const sql2 = `INSERT INTO vending_machine VALUES (?, ?, ?, ?);`;

      connection.query(sql2, [location_id, location_id, vendor_name, status], (err1, result1) => {
          if (err1) {
              res.status(500).send(err1);
              return;
          }

          res.json({ "added": true });
      })

  })
})

// 订阅路由
app.post('/subscribe', async (req, res) => {
    console.log('收到订阅请求:', req.body);

    const { email } = req.body;

    if (!email) {
        console.log('缺少邮箱地址');
        return res.status(400).json({ error: '邮箱地址是必需的' });
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('邮箱格式不正确:', email);
        return res.status(400).json({ error: '邮箱格式不正确' });
    }

    try {
        // 检查是否已订阅
        const checkQuery = 'SELECT * FROM subscribers WHERE email = ?';
        connection.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('数据库查询错误:', err);
                return res.status(500).json({ error: '数据库错误: ' + err.message });
            }

            if (results.length > 0) {
                console.log('邮箱已存在:', email);
                return res.status(400).json({ error: '该邮箱已经订阅' });
            }

            // 添加新订阅者
            const insertQuery = 'INSERT INTO subscribers (email) VALUES (?)';
            connection.query(insertQuery, [email], async (err, result) => {
                if (err) {
                    console.error('数据库插入错误:', err);
                    return res.status(500).json({ error: '数据库错误: ' + err.message });
                }

                console.log('订阅者添加成功，准备发送欢迎邮件');

                // 发送欢迎邮件
                try {
                    const emailSent = await sendWelcomeEmail(email);
                    if (!emailSent) {
                        console.error('发送欢迎邮件失败');
                        // 即使邮件发送失败，我们仍然保留订阅记录
                        return res.status(200).json({ 
                            message: '订阅成功，但欢迎邮件发送失败，我们会稍后重试',
                            warning: '欢迎邮件发送失败'
                        });
                    }

                    console.log('订阅流程完成');
                    res.json({ message: '订阅成功！欢迎邮件已发送' });
                } catch (emailError) {
                    console.error('发送邮件时发生错误:', emailError);
                    res.status(200).json({ 
                        message: '订阅成功，但欢迎邮件发送失败，我们会稍后重试',
                        warning: '欢迎邮件发送失败'
                    });
                }
            });
        });
    } catch (error) {
        console.error('服务器错误:', error);
        res.status(500).json({ error: '服务器错误: ' + error.message });
    }
});

///////////////
// Start the server  
app.listen(8081, () => {
  console.log(`Server running at http://127.0.0.1:8081`);
});
