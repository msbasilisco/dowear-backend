const db = require('../models');
const { Order, Cart, Product, Variation } = db;

// Create order from cart items
const createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { userID, shipping_address, recipient_name, contact_number, shipping_fee, payment_method } = req.body;
        
        // 1. Get all cart items marked as 'checkout' with their product details
        const cartItems = await Cart.findAll({
            where: {
                userID,
                status: 'checkout'
            },
            include: [{
                model: Product,
                as: 'product',
                include: [{ 
                    model: Variation, 
                    as: 'variations' 
                }]
            }],
            transaction: t
        });

        if (!cartItems.length) {
            throw new Error('No items selected for checkout');
        }

        // 2. Verify stock availability for all items
        for (const item of cartItems) {
            const variation = item.variationID ? 
                item.product.variations.find(v => v.variationID === item.variationID) : 
                null;
            
            if (variation && variation.quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product.name}`);
            }
        }

        // 3. Calculate total amount
        const total_amount = cartItems.reduce((sum, item) => {
            return sum + Number(item.subtotal);
        }, Number(shipping_fee));

        // 4. Create the order
        const order = await Order.create({
            userID,
            shipping_address,
            recipient_name,
            contact_number,
            shipping_fee,
            total_amount,
            payment_method,
            status: 'pending',
            order_date: new Date()
        }, { transaction: t });

        // 5. Create order items and update stock
        const orderItems = await Promise.all(
            cartItems.map(async (item) => {
                // Update stock if there's a variation
                if (item.variationID) {
                    await Variation.decrement('quantity', {
                        by: item.quantity,
                        where: { variationID: item.variationID },
                        transaction: t
                    });
                }

                return OrderItem.create({
                    orderID: order.orderID,
                    productID: item.productID,
                    variationID: item.variationID,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal
                }, { transaction: t });
            })
        );

        // 6. Delete the cart items
        await Cart.destroy({
            where: {
                userID,
                status: 'checkout'
            },
            transaction: t
        });

        await t.commit();
        
        return res.status(201).json({
            success: true,
            order,
            orderItems
        });

    } catch (error) {
        await t.rollback();
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update shipping details
const updateShippingDetails = async (req, res) => {
    try {
        const { orderID } = req.params;
        const { recipient_name, shipping_address, contact_number } = req.body;
        const userID = req.user.userID;

        const order = await Order.findOne({
            where: { orderID, userID, status: 'pending' }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or cannot be modified'
            });
        }

        await order.update({
            recipient_name,
            shipping_address,
            contact_number
        });

        return res.status(200).json({
            success: true,
            message: 'Shipping details updated successfully',
            data: order
        });

    } catch (error) {
        console.error('Update shipping details error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update shipping details'
        });
    }
};

// Get all orders
const getOrders = async (req, res) => {
    try {
        const userID = req.user.userID;
        const orders = await Order.findAll({
            where: { userID },
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

// Get orders by status (delivered/cancelled)
const getOrdersByStatus = async (req, res) => {
    try {
        const userID = req.user.userID;
        const { status } = req.query; // status can be 'delivered' or 'cancelled'
        
        if (!['delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status parameter'
            });
        }

        const orders = await Order.findAll({
            where: { 
                userID,
                status: status 
            },
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get orders by status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const { orderID } = req.params;
        const userID = req.user.userID;

        const order = await Order.findOne({
            where: { 
                orderID, 
                userID,
                status: 'pending' // Only pending orders can be cancelled
            },
            include: [{
                model: db.OrderItem,
                as: 'items'
            }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Order not found or cannot be cancelled'
            });
        }

        // Restore inventory
        for (const item of order.items) {
            if (item.variationID) {
                await Variation.increment('quantity', {
                    by: item.quantity,
                    where: { variationID: item.variationID },
                    transaction
                });
            }
        }

        await order.update({ status: 'cancelled' }, { transaction });
        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Cancel order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
};

// Get order details
const getOrderDetails = async (req, res) => {
    try {
        const { orderID } = req.params;
        const userID = req.user.userID;

        const order = await Order.findOne({
            where: { orderID, userID },
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product'
                }, {
                    model: Variation,
                    as: 'variation'
                }]
            }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order details error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderID } = req.params;
        const { status } = req.body;
        const userID = req.user.userID;

        // Check if the user is the seller of the products in the order
        const order = await Order.findOne({
            where: { orderID },
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    where: { seller_id: userID } // Ensure the user is the seller
                }]
            }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or you are not authorized to update this order'
            });
        }

        // Validate the new status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Update the order status
        await order.update({ status });

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

module.exports = {
    createOrder,
    updateShippingDetails,
    getOrders,
    getOrdersByStatus,
    cancelOrder,
    getOrderDetails,
    updateOrderStatus
};
