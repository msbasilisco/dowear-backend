const db = require('../models');
const { Cart, Product, Variation } = db;

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { productID, variationID, quantity } = req.body;
        const userID = req.user.userID;

        const product = await Product.findByPk(productID, {
            include: [{
                model: Variation,
                as: 'variations',
                where: variationID ? { variationID } : undefined
            }]
        });

        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        //Validate stock availability
        const variation = product.variations[0];
        if (!variation || variation.quantity < quantity) {
            return res.status(400).send({ 
                message: 'Insufficient stock available',
                availableStock: variation ? variation.quantity : 0 
            });
        }

        let existingItem = await Cart.findOne({
            where: { userID, productID, variationID, status: 'active' }
        });

        const price = variationID ? variation.price : product.price;
        const subtotal = price * quantity;

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.subtotal = existingItem.quantity * price;
            await existingItem.save();
            return res.status(200).send({ message: 'Cart updated successfully', data: existingItem });
        }

        const cartItem = await Cart.create({
            userID, productID, variationID, quantity, subtotal, status: 'active'
        });

        return res.status(201).send({ message: 'Item added to cart', data: cartItem });

    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).send({ message: 'Failed to add item to cart' });
    }
};

// Update cart item quantity
const updateQuantity = async (req, res) => {
    try {
        const { cartID, quantity } = req.body;
        const userID = req.user.userID;

        if (quantity < 1) {
            return res.status(400).send({ 
                message: 'Quantity cannot be less than 1'
            });
        }

        const cartItem = await Cart.findOne({
            where: { cartID, userID, status: 'active' },
            include: [{
                model: Product,
                as: 'product',
                include: [{ model: Variation, as: 'variations' }]
            }]
        });

        if (!cartItem) {
            return res.status(404).send({ message: 'Cart item not found' });
        }

        //Validate stock availability
        const variation = cartItem.product.variations[0];
        if (quantity > variation.quantity) {
            return res.status(400).send({ 
                message: 'Requested quantity exceeds available stock',
                availableStock: variation.quantity 
            });
        }

        //Update cart item quantity and subtotal
        const price = cartItem.variationID ? variation.price : cartItem.product.price;
        cartItem.quantity = quantity;
        cartItem.subtotal = quantity * price;
        await cartItem.save();

        return res.status(200).send({ message: 'Quantity updated', data: cartItem });

    } catch (error) {
        console.error('Update quantity error:', error);
        return res.status(500).send({ message: 'Failed to update quantity' });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { cartID } = req.params;
        const userID = req.user.userID;

        const deleted = await Cart.destroy({
            where: { cartID, userID, status: 'active' }
        });

        if (!deleted) {
            return res.status(404).send({ message: 'Cart item not found' });
        }

        return res.status(200).send({ message: 'Item removed from cart' });

    } catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).send({ message: 'Failed to remove item' });
    }
};

// Get user's cart
const getCart = async (req, res) => {
    try {
        const userID = req.user.userID;

        const cartItems = await Cart.findAll({
            where: { userID, status: 'active' },
            include: [{
                model: Product,
                as: 'product',
                include: [{ model: Variation, as: 'variations' }]
            }]
        });

        const total = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
        return res.status(200).send({ items: cartItems, total });

    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).send({ message: 'Failed to fetch cart' });
    }
};

// Toggle selection between active and checkout
//active: item is in the cart
//checkout: item is selected for checkout
const toggleSelection = async (req, res) => {
    try {
        const { cartID } = req.params;
        const userID = req.user.userID;

        const cartItem = await Cart.findOne({
            where: { cartID, userID }
        });

        // Toggle between 'active' and 'checkout'
        cartItem.status = cartItem.status === 'active' ? 'checkout' : 'active';
        await cartItem.save();

        return res.status(200).json({
            success: true,
            message: 'Selection updated',
            data: cartItem
        });
    } catch (error) {
        console.error('Toggle selection error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update selection'
        });
    }
};

module.exports = {
    addToCart,
    updateQuantity,
    removeFromCart,
    getCart,
    toggleSelection,
};
