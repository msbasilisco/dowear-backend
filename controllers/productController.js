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

// const updateProduct = async (req, res) => {
//     try {
//         const {id} = req.params.id;
//         const [updated] = await Product.update(req.body, { where: {productID: id } });

//         if (updated) {
//             const updatedProduct = await Product.findByPk(id);
//             return res.status(200).json({
//                 success: true,
//                 message: 'Product updated successfully',
//                 data: updatedProduct
//             });
//         }

//         return res.status(404).json({
//             success: false,
//             error: 'Product not found'
//         });
//     } catch (error) {
//         console.error('Update product error:', error);
//         return res.status(500).json({
//             success: false,
//             error: 'Failed to update product',
//             message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//         });
//     }
// };

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
        return res.status(200).json({
           success: true,
           data: products
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
// Get all available tags
const getAllTags = async (req, res) => {
   try {
       const tags = await Tag.findAll({
           attributes: [
               'tagID',
               'name',
               [
                   db.sequelize.literal('(SELECT COUNT(*) FROM "ProductTags" WHERE "ProductTags"."tagID" = "Tag"."tagID")'),
                   'productCount'
               ]
           ],
           order: [[db.sequelize.literal('productCount'), 'DESC']]
       });
        return res.status(200).json({
           success: true,
           data: tags
       });
    } catch (error) {
       console.error('Get all tags error:', error);
       return res.status(500).json({
           success: false,
           error: 'Failed to get tags',
           message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
       });
   }
;
};
module.exports = {
   createProduct,
   deleteProduct,
   getProductsByTag,
   getAllTags
};