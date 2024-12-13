const { cloudinary, storage } = require('../config/cloudinaryConfig'); 
const db = require('../models');
const { Product, Category, Variation, Tag } = db;


// Function to upload image to Cloudinary
const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: 'productsImage',
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(error);
            }
            resolve(result);
        });

       
        stream.end(fileBuffer);
    });
};

// Create Product
const createProduct = async (req, res) => {
    try {
        const seller_id = req.user.userID;
        const { 
            title, 
            description, 
            keyTags,    
            categoryID, 
            variations 
        } = req.body;

        let parsedVariations;
        if (typeof variations === 'string') {
            try {
                parsedVariations = JSON.parse(variations);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Variations must be a valid JSON string'
                });
            }
        } else {
            parsedVariations = variations; 
        }

    
        console.log('Parsed Variations:', parsedVariations);

        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Product image is required'
            });
        }

       
        console.log('Type of req.file.buffer:', Buffer.isBuffer(req.file.buffer)); 

      
        const image = await uploadImageToCloudinary(req.file.buffer);

       
        const requiredFields = {
            title: !title?.trim() && 'Product title is required',
            categoryID: !categoryID && 'Category is required',
            variations: (!Array.isArray(parsedVariations) || parsedVariations.length === 0) && 
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

        const isValidVariations = parsedVariations.every(({ variation, price, quantity }) => 
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
         
        const result = await db.sequelize.transaction(async (transaction) => {
            const product = await Product.create({
                title: title.trim(),
                description: description?.trim() || null, 
                product_image_public_id: image.public_id, 
                product_image_url: image.secure_url, 
                categoryID,
                seller_id
            }, { transaction });
            
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
          
            const variationsData = parsedVariations.map(({ variation, price, quantity }) => ({
                variation: variation.trim(),
                price: Number(price),
                quantity: Number(quantity),
                productID: product.productID
            }));
            await Variation.bulkCreate(variationsData, { transaction });
           
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
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            details: error
        });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; 
        const { title, description, categoryID, variations } = req.body;

        const userId = req.user.userID; 
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (product.seller_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to update this product'
            });
        }

       
        let parsedVariations;
        if (typeof variations === 'string') {
            try {
                parsedVariations = JSON.parse(variations);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Variations must be a valid JSON string'
                });
            }
        } else {
            parsedVariations = variations;
        }

        const updatedProductData = {
            title: title !== undefined ? title : product.title,
            description: description !== undefined ? description : product.description,
            product_image_public_id: req.file ? (await uploadImageToCloudinary(req.file.buffer)).public_id : product.product_image_public_id,
            product_image_url: req.file ? (await uploadImageToCloudinary(req.file.buffer)).secure_url : product.product_image_url,
            categoryID: categoryID !== undefined ? categoryID : product.categoryID
        };

        await Product.update(updatedProductData, { where: { productID: id } });

        
        if (parsedVariations) {
            await Variation.destroy({ where: { productID: id } }); 

            const variationsData = parsedVariations.map(({ variation, price, quantity }) => ({
                variation: variation.trim(),
                price: Number(price),
                quantity: Number(quantity),
                productID: id
            }));

            await Variation.bulkCreate(variationsData);
        }

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

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userID; 
        console.log(`Attempting to delete product with ID: ${id}`); 

        const product = await Product.findOne({ where: { productID: id } });

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (product.seller_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to delete this product'
            });
        }

        const deleted = await Product.destroy({ where: { productID: id } });
        console.log(`Delete result: ${deleted}`);

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

        console.log('Products found:', products);

        const productsWithRelated = await Promise.all(products.map(async (product) => {
            try {
                const relatedItems = await getRelatedItems(product.productID); 
                return { product, relatedItems };
            } catch (error) {
                console.error(`Error fetching related items for product ID ${product.productID}:`, error);
                return { product, relatedItems: [] }; 
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
        const { catID } = req.params; 

        const products = await Product.findAll({
            where: { categoryID: catID }
        });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No products found for this category'
            });
        }

        console.log('Products found:', products);

        const productsWithRelated = await Promise.all(products.map(async (product) => {
            try {
                const relatedItems = await getRelatedItems(product.productID); 
                return { product, relatedItems };
            } catch (error) {
                console.error(`Error fetching related items for product ID ${product.productID}:`, error);
                return { product, relatedItems: [] }; 
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
        const product = await Product.findByPk(productId, {
            include: [{ model: Tag, as: 'tags' }] 
        });

        if (!product) {
            throw new Error('Product not found');
        }

        const relatedItems = await Product.findAll({
            where: {
                [db.Sequelize.Op.or]: [
                    { categoryID: product.categoryID }, 
                    { id: { [db.Sequelize.Op.ne]: productId } }
                ]
            },
            limit: 10 
        });

        return relatedItems;
    } catch (error) {
        console.error('Error fetching related items:', error);
        throw error;
    }
};

const getLatestProducts = async( req, res)=>{
    try{
        const latestProducts = await Product.findAll({
            order: [['createdAt', 'DESC']],
            limit: 15
        });
    
        return res.status(200).json({
            success: true,
            data: latestProducts
        });
    }catch(error){
        console.error('Get latest products error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get latest products',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }

}

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
    getAllProducts,
    getLatestProducts,
};