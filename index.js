const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname); // Set the filename for the uploaded file
    },
  });
  
  const upload = multer({ storage: storage });

const { MongoClient, ObjectId} = require('mongodb');
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
          
          const products = await  addedProductCollection.find().toArray();
          res.json(products);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Failed to retrieve products' });
        }
      });
      app.get('/addedProduct/:id', async (req, res) => {
        try {
          const id = req.params.id;
          const product = await addedProductCollection.findOne({ _id: new ObjectId(id) });
          res.json(product);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Failed to retrieve product' });
        }
      });
     
  
      app.post('/addedProduct', upload.single('picture'), async (req, res) => {
        try {
          const {
            product,
            brandName,
            productGroup,
            category,
            unit,
            purchasePrice,
            salePrice,
            description
          } = req.body;
          const picture = req.file;
      
          const addedProduct = {
            product,
            brandName,
            productGroup,
            category,
            unit,
            purchasePrice,
            salePrice,
            description,
            picture: picture.filename
          };
      
          const insertedProduct = await addedProductCollection.insertOne(addedProduct);
          if (insertedProduct.insertedId) {
            res.json({ message: 'Product added successfully' });
          } else {
            res.status(500).json({ message: 'Failed to add product' });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Failed to add product' });
        }
      });
      
      app.put('/updateProduct/:id', upload.single('picture'), async (req, res) => {
        try {
          const productId = req.params.id;
          console.log(productId);
          const {
            product,
            brandName,
            productGroup,
            category,
            unit,
            purchasePrice,
            salePrice,
            description,
            } = req.body;
          const picture = req.file; 
          const updatedProduct = {
            product,
            brandName,
            productGroup,
            category,
            unit,
            purchasePrice,
            salePrice,
            description,
            picture: picture.filename
          };
      
          // Check if a new picture was uploaded
          if (req.file) {
            updatedProduct.picture = req.file.filename;
          }
      
          const updatedProductResult = await addedProductCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: updatedProduct }
          );
      
          if (updatedProductResult.modifiedCount > 0) {
            res.json({ message: 'Product updated successfully' });
          } 
          else {
            res.status(404).json({ message: 'Product not found' });
          }
        } catch (error) {
          console.error('Error updating product:', error);
          res.status(500).json({ message: 'Failed to update product' });
        }
      });
      
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
app.get('/', (req, res) => {
    res.send('Server is running');
  });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
