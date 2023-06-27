const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId} = require('mongodb');
const uri = "mongodb+srv://bitsolution_task:Fp1JbJYDaoqaknRz@cluster0.qhdslp1.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    
    const productCollection = client.db('bitSolution_taskDB').collection('products');
    const addedProductCollection = client.db('bitSolution_taskDB').collection('addedProduct');


 
    app.get('/allProducts', async (req, res) => {
      try {
        
        const products = await productCollection.find().toArray();
        res.json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve products' });
      }
    });
    app.get('/addedProduct', async (req, res) => {
        try {
          
          const products = await  addedProductCollection.find().toArray();
          res.json(products);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Failed to retrieve products' });
        }
      });
      app.post('/addedProduct', async (req, res) => {
        const newItem = req.body;
        const result = await addedProductCollection.insertOne(newItem)
        res.send(result);
      })
      app.delete('/addedProduct/:id', async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await addedProductCollection.deleteOne(query);
          if (result.deletedCount > 0) {
            res.status(200).json({ deletedCount: result.deletedCount });
          } else {
            res.status(404).json({ error: 'Product not found' });
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      

    // Ping the deployment to confirm successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged the deployment. You successfully connected to MongoDB!');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

run().catch(console.error);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
