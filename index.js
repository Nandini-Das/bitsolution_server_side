const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient} = require('mongodb');
const uri = "mongodb+srv://bitsolution_task:Fp1JbJYDaoqaknRz@cluster0.qhdslp1.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Define the collection
    const productCollection = client.db('bitSolution_taskDB').collection('products');

    // GET /products endpoint to retrieve all products
    app.get('/allProducts', async (req, res) => {
      try {
        // Fetch all products from the collection
        const products = await productCollection.find().toArray();
        res.json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve products' });
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
