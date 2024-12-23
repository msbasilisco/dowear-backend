const { cloudinary, storage } = require('../config/cloudinaryConfig'); 
const db = require('../models');
const { Product, Category, Variation, Tag, User, ProductTag } = db;

// upload image to Cloudinary
const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: 'productsImage',
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(error);
            }
            resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
            });
        });
        // console.log('File buffer size:', fileBuffer.length);
        stream.end(fileBuffer);
    });
};

// Create Product
const createProduct = async (req, res) => {
    try {
        console.log('Inside createProduct Controller...');
        console.log('Request Body:', req.body);
        console.log('Uploaded File:', req.file);

        const seller_id = req.user?.userID;

        if (!seller_id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: seller_id missing.' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required.' });
        }

        const cloudinaryResult = await uploadImageToCloudinary(req.file.buffer);
        
        const productData = JSON.parse(req.body.productData);
        // console.log('Req body body u:', req.body.productData);
        const { categoryID, title, description, tags, variations } = productData;
        
        const tagArray = typeof tags === 'string' ? tags.split(/\s+/).filter(Boolean) : [];

        if (!variations || variations.length === 0 || variations.some(v => !v.variation || !v.quantity || !v.price)) {
            return res.status(400).json({ success: false, message: 'Variations must be properly defined.' });
        }

        const newProduct = {
            seller_id,
            categoryID,
            title,
            description,
            // tags: tagArray,
            // variations,
            product_image_public_id: cloudinaryResult.public_id,
            product_image_url: cloudinaryResult.secure_url,
        };

        const savedProduct = await Product.create(newProduct);

        for (const variation of variations) {
            await Variation.create({
                productID: savedProduct.productID,
                variation: variation.variation,
                price: variation.price,
                quantity: variation.quantity,
            });
        }

        console.log('Saved Product:', savedProduct);

        const tagInstances = [];
        for (const tag of tagArray) {
            let existingTag = await Tag.findOne({ where: { tagName: tag } });
            console.log('Existing Tag:', existingTag);
            if (!existingTag) {
                existingTag = await Tag.create({ tagName: tag });
            }
            tagInstances.push(existingTag);
        }

        if (tagArray.length > 0) {
            const tagInstances = [];
            for (const tag of tagArray) {
                let existingTag = await Tag.findOne({ where: { tagName: tag } });
                if (!existingTag) {
                    existingTag = await Tag.create({ tagName: tag });
                }
                tagInstances.push(existingTag);
            }

            for (const tagInstance of tagInstances) {
                await ProductTag.create({
                    productID: savedProduct.productID,
                    tagID: tagInstance.tagID,
                });
            
                console.log('ProductTag Entry Created:', {
                    productID: savedProduct.productID,
                    tagID: tagInstance.tagID,
                });
            }
        }
        
        if (!categoryID || !title || !description || !tags || !variations) {
            return res.status(400).json({ success: false, message: 'All product fields are required.' });
        }
        console.log('Received Product Data:', productData);
        console.log('Variations:', variations);

        // const savedProduct = await Product.create(newProduct);

        return res.status(201).json({ success: true, product: savedProduct });
    } catch (error) {
        console.error('Product creation error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error });
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

const getProductDetails = async (req, res) => {
    const { productID } = req.params;

    try {
        const product = await Product.findOne({
            where: { productID },
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['username', 'user_address'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['categoryName'],
                },
                {
                    model: Variation,
                    as: 'variations',
                    attributes: ['variationID', 'variation', 'price', 'quantity'],
                },
            ],
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        return res.status(200).json({
            success: true,
            product: {
                productID: product.productID,
                title: product.title,
                description: product.description,
                imageUrl: product.product_image_url,
                seller: {
                    username: product.seller?.username || 'Unknown',
                    user_address: product.seller?.user_address || 'Unknown',
                },
                category: product.category?.categoryName || 'No Category',
                variations: product.variations.map(variation => ({
                    variationID: variation.variationID,
                    name: variation.variation,
                    price: variation.price,
                    quantity: variation.quantity,
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch product details.',
        });
    }
};

const getAllProductsByUser = async (req, res) => {
    try {
        const seller_id = req.user?.userID;

        if (!seller_id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: seller_id missing.' });
        }

        const userProducts = await Product.findAll({
            where: { seller_id },
            attributes: ['productID', 'title', 'product_image_url', 'description'],
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['username', 'user_address'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['categoryName'],
                },
                {
                    model: Variation,
                    as: 'variations',
                    attributes: ['variationID', 'variation', 'price', 'quantity']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // console.log('Fetched Products:', userProducts);

        if (!userProducts.length) {
            return res.status(404).json({ success: false, message: 'No products found for this user.' });
        }

        return res.status(200).json({ 
            success: true, 
            products: userProducts.map(product => ({
                productID: product.productID,
                title: product.title,
                imageUrl: product.product_image_url,
                description: product.description,
                seller: {
                    username: product.seller?.username || 'Unknown',
                    user_address: product.seller?.user_address || 'Unknown',
                },
                category: {
                    category: product.category?.categoryName || 'No Category'
                },
                variations: product.variations.map(variation => ({
                    variationID: variation.variationID,
                    name: variation.variation,
                    price: variation.price,
                    quantity: variation.quantity,
                }))
            })),
        });
    } catch (error) {
        console.error('Error fetching user products:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch user products', error });
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
    getAllProductsByUser,
    getProductDetails
};