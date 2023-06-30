const express = require('express');

const app = express();


const cors = require('cors');
const port = process.env.PORT || 5000;
const axios = require('axios');

// Middleware
app.use(cors());
app.use(express.json());
const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://bitsolution_task:Fp1JbJYDaoqaknRz@cluster0.qhdslp1.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {

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
        const products = await addedProductCollection.find().toArray();
        res.json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve products' });
      }
    });


    app.get('/addedProduct/:id', async (req, res) => {
      try {
        const id = req.params.id;

        // Validate the id format
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await addedProductCollection.findOne({ _id: new ObjectId(id) });
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve product' });
      }
    });




    app.post('/addedProduct', async (req, res) => {
      const newItem = req.body;
    
      try {
        const insertedProduct = await addedProductCollection.insertOne(newItem);
        if (insertedProduct && insertedProduct.insertedId) {
          res.json({ message: 'Product added successfully' });
        } else {
          res.status(500).json({ message: 'Failed to add product' });
        }
      } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Failed to add product' });
      }
    });


    app.patch('/updateProduct/:id', async (req, res) => {
      const id = req?.params?.id;
      const updatedProduct = req.body;
    
      try {
        if (id) {
          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updatedProduct
            }
          };
    
          const result = await addedProductCollection.updateOne(filter, updateDoc);
          
          if (result.modifiedCount > 0) {
            res.json({ message: 'Product updated successfully', modifiedCount: result.modifiedCount });
          } else {
            res.status(404).json({ message: 'Product not found' });
          }
        } else {
          res.status(400).send('Invalid product ID');
        }
      } catch (error) {
        res.status(500).send(error.message);
      }
    });
    

    app.delete('/addedProduct/:id', async (req, res) => {
      try {
        const id = req.params.id; 
        const query = { _id: new ObjectId(id) }; // Create a query to find the product with the specified ID
        const result = await addedProductCollection.deleteOne(query); // Delete the product matching the query
        if (result.deletedCount > 0) {
          // If the deletedCount is greater than 0, it means a product was deleted
          res.status(200).json({ deletedCount: result.deletedCount, message: 'Product deleted successfully' });
        } else {
          // If no product was deleted, it means the product was not found
          res.status(404).json({ error: 'Product not found', deletedCount: 0, message: 'Product not found or already deleted' });
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error', deletedCount: 0, message: 'Internal server error occurred' });
      }
    });
    

    // Ping the deployment to confirm successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

