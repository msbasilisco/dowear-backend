const db = require('../models');
const { Product, Category, Variation, Tag } = db;
const createProduct = async (req, res) => {
   try {
       const seller_id = req.user.userID;
       const { 
           title, 
           description, 
           product_image, 
           keyTags,    
           categoryID, 
           variations 
       } = req.body;
        // Validate required fields
       const requiredFields = {
           title: !title?.trim() && 'Product title is required',
           categoryID: !categoryID && 'Category is required',
           variations: (!Array.isArray(variations) || variations.length === 0) && 
               'At least one variation is required'
       };
        const missingField = Object.entries(requiredFields)
           .find(([_, error]) => error);
        if (missingField) {
           return res.status(400).json({ 
               success: false,
               error: missingField[1]
           });
       }
        // Validate variations format
       const isValidVariations = variations.every(({ variation, price, quantity }) => 
           typeof variation === 'string' && variation.trim() &&
           typeof price === 'number' && price > 0 &&
           typeof quantity === 'number' && quantity >= 0
       );
        if (!isValidVariations) {
           return res.status(400).json({ 
               success: false,
               error: 'Each variation must have a name, positive price, and non-negative quantity'
           });
       }
        // Create product with variations and tags in a transaction
       const result = await db.sequelize.transaction(async (transaction) => {
           // Create the product
           const product = await Product.create({
               title: title.trim(),
               description: description?.trim() || null,
               product_image: product_image?.trim() || null,
               categoryID,
               seller_id
           }, { transaction });
            // Handle tags if provided
           if (keyTags) {
               const tagNames = keyTags
                   .split(/\s+/)
                   .map(tag => tag.trim().toLowerCase())
                   .filter(Boolean);
                const tags = await Promise.all(
                   tagNames.map(name => 
                       Tag.findOrCreate({
                           where: { name },
                           transaction
                       }).then(([tag]) => tag)
                   )
               );
                await product.setTags(tags, { transaction });
           }
            // Handle variations
           const variationsData = variations.map(({ variation, price, quantity }) => ({
               variation: variation.trim(),
               price: Number(price),
               quantity: Number(quantity),
               productID: product.productID
           }));
            await Variation.bulkCreate(variationsData, { transaction });
            // Fetch created product with all relations
           return await Product.findOne({
               where: { productID: product.productID },
               include: [
                   {
                       model: Variation,
                       as: 'variations'
                   },
                   {
                       model: Category,
                       as: 'category',
                       attributes: ['categoryID', 'categoryName']
                   },
                   {
                       model: Tag,
                       as: 'tags',
                       through: { attributes: [] }
                   }
               ],
               transaction
           });
       });
        return res.status(201).json({
           success: true,
           message: 'Product created successfully',
           data: result
       });
    } catch (error) {
       console.error('Product creation error:', error);
       return res.status(500).json({ 
           success: false,
           error: 'Failed to create product',
           message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
       });
   }
};


const updateProduct = async (req, res) => {
    try {
        const{id} = req.params; // Get the product ID from the request parameters
        const { title, description, product_image, keyTags, categoryID, variations } = req.body;

        // Find the product by ID
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Update the product details, excluding productID
        const updatedProductData = {
            title: title !== undefined ? title : product.title,
            description: description !== undefined ? description : product.description,
            product_image: product_image !== undefined ? product_image : product.product_image,
            categoryID: categoryID !== undefined ? categoryID : product.categoryID
        };

        // Update the product in the database
        await Product.update(updatedProductData, { where: { productID: id } });

        // Handle variations if provided
        if (variations) {
            // Assuming you want to replace existing variations
            await Variation.destroy({ where: { productID: id } }); // Remove existing variations

            const variationsData = variations.map(({ variation, price, quantity }) => ({
                variation: variation.trim(),
                price: Number(price),
                quantity: Number(quantity),
                productID: id
            }));

            await Variation.bulkCreate(variationsData); // Add new variations
        }

        // Fetch the updated product with all relations
        const updatedProduct = await Product.findOne({
            where: { productID: id },
            include: [
                {
                    model: Variation,
                    as: 'variations'
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['categoryID', 'categoryName']
                },
                {
                    model: Tag,
                    as: 'tags',
                    through: { attributes: [] }
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update product',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete product with ID: ${id}`); // Log the ID
        
        const deleted = await Product.destroy({ where: { productID: id } });
        console.log(`Delete result: ${deleted}`); // Log the result of the delete operation

        if (deleted) {
            return res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
        }

        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete product',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};



// Get products by tag
const getProductsByTag = async (req, res) => {
    try {
        const { tagName } = req.params;
        const products = await Product.findAll({
            include: [
                {
                    model: Tag,
                    as: 'tags',
                    where: { name: tagName.toLowerCase() },
                    through: { attributes: [] }
                },
                {
                    model: Variation,
                    as: 'variations'
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['categoryID', 'categoryName']
                }
            ]
        });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No products found for this tag'
            });
        }

        // Log the products found
        console.log('Products found:', products);

        // Fetch related items for each product
        const productsWithRelated = await Promise.all(products.map(async (product) => {
            try {
                const relatedItems = await getRelatedItems(product.productID); // Ensure you're using the correct ID field
                return { product, relatedItems };
            } catch (error) {
                console.error(`Error fetching related items for product ID ${product.productID}:`, error);
                return { product, relatedItems: [] }; // Return the product with an empty related items array on error
            }
        }));

        return res.status(200).json({
            success: true,
            data: productsWithRelated
        });

    } catch (error) {
        console.error('Get products by tag error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get products',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getAllProductsByCategory = async (req, res) => {
    try {
        const { catID } = req.params; // Extract category ID from request parameters

        // Fetch all products that belong to the specified category
        const products = await Product.findAll({
            where: { categoryID: catID }
        });

        // Check if products were found
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No products found for this category'
            });
        }

        console.log('Products found:', products);

        const productsWithRelated = await Promise.all(products.map(async (product) => {
            try {
                const relatedItems = await getRelatedItems(product.productID); // Ensure you're using the correct ID field
                return { product, relatedItems };
            } catch (error) {
                console.error(`Error fetching related items for product ID ${product.productID}:`, error);
                return { product, relatedItems: [] }; // Return the product with an empty related items array on error
            }
        }));
    

        return res.status(200).json({
            success: true,
            data: productsWithRelated
        });

    } catch (error) {
        console.error('Get all products by category error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get products',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getRelatedItems = async (productId) => {
    try {
        // Find the product by ID
        const product = await Product.findByPk(productId, {
            include: [{ model: Tag, as: 'tags' }] // Include tags if you have a many-to-many relationship
        });

        if (!product) {
            throw new Error('Product not found');
        }

        // Get related items based on the same category or tags
        const relatedItems = await Product.findAll({
            where: {
                [db.Sequelize.Op.or]: [
                    { categoryID: product.categoryID }, // Same category
                    { id: { [db.Sequelize.Op.ne]: productId } } // Exclude the current product
                ]
            },
            limit: 10 // Limit the number of related items returned
        });

        return relatedItems;
    } catch (error) {
        console.error('Error fetching related items:', error);
        throw error;
    }
};

const getAllProducts = async (req, res) => {
    try {
        
        const randomProducts = await Product.findAll({
            order: db.sequelize.random()
        });

        return res.status(200).json({
            success: true,
            data: randomProducts
        });
    } catch (error) {
        console.error('Get all products error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get products',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
   createProduct,
   updateProduct,
   deleteProduct,
   getProductsByTag,
   getAllProductsByCategory,
   getRelatedItems,
   getAllProducts
};