import Product from "../models/product.model.js";

// getting all cart products
export const getCartProducts = async (req, res) => {
	try {
		// Extract product IDs from cartItems
		const productIds = req.user.cartItems.map(item => item._id);

		// Fetch products from MongoDB that match the extracted IDs
		const products = await Product.find({ _id: { $in: productIds } });
		// console.log(products)
		// Add quantity for each product
		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find(
				(cartItem) => cartItem._id.toString() === product._id.toString()
			);
			return { ...product.toObject(), quantity: item ? item.quantity : 1 };
		});
		// console.log(cartItems)
		// Send the response with the updated cart items
		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// adding an item to the card
export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.id === productId);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push(productId);
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

//  removes all products from the user's cart or removes a specific product based on the request
export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

        // If productId is NOT provided, empty the entire cart
		if (!productId) {
			user.cartItems = [];
		} else {
            // If a productId is provided, remove only that product
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}
		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// clears the cart
export const clearCart = async (req, res) => {
	try {
		const user = req.user;
		user.cartItems = [];
		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in clearCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// updating the quantity
export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;
		const existingItem = user.cartItems.find((item) => item.id === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter((item) => item.id !== productId);
				await user.save();
				return res.json(user.cartItems);
			}

			existingItem.quantity = quantity;
			await user.save();
			res.json(user.cartItems);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};