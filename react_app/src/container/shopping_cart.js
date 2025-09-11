import React, { useEffect, useState } from "react";

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    color: "#333",
    marginBottom: "20px",
  },
  productsContainer: {
    marginBottom: "30px",
  },
  productItem: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9",
  },
  productName: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
  },
  productPrice: {
    fontSize: "16px",
    color: "#666",
    margin: "0 0 10px 0",
  },
  addButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cartContainer: {
    marginTop: "20px",
  },
  cartItem: {
    padding: "10px",
    marginTop: "8px",
    border: "1px solid #eee",
    borderRadius: "6px",
    backgroundColor: "#fff",
  },
  cartItemName: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
  },
  cartItemDetails: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 10px 0",
  },
  quantityButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  emptyCart: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
  },
  total: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    marginTop: "15px",
    textAlign: "right",
  },
};

const ShoppingCart = () => {
  const products = [
    { id: 1, name: "Product 1", price: 29.99 },
    { id: 2, name: "Product 2", price: 39.99 },
    { id: 3, name: "Product 3", price: 19.99 }
  ];

  const [cart, setCart] = useState([]);

  useEffect(() => {
    console.log(" products ", products)
  }, [])

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) => item.id === product.id ? {
          ...item, quantity: item.quantity + 1
        } : item);
      }
      return [...prevCart,
      { ...product, quantity: 1 }]
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem.quantity === 1) {
        return prevCart.filter((item) => item.id !== productId)
      }
      return prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) =>
      total + item.price * item.quantity, 0);
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Shopping Cart</h4>

      <div style={styles.productsContainer}>
        <h4 style={styles.title}>Products</h4>
        {products.map((product) => {
          return <div key={product.id} style={styles.productItem}>
            <p style={styles.productName}>{product.name}</p>
            <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
            <button 
              style={styles.addButton}
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        })}
      </div>

      <div style={styles.cartContainer}>
        <h4 style={styles.title}>Cart Summary</h4>
        {cart.length === 0 ? (
          <p style={styles.emptyCart}>Empty Cart</p>
        ) : (
          <div>
            {cart.map((item) => {
              return <div key={item.id} style={styles.cartItem}>
                <p style={styles.cartItemName}>{item.name}</p>
                <p style={styles.cartItemDetails}>
                  Price: ${item.price.toFixed(2)} | quantity: {item.quantity}
                </p>
                <button 
                  style={styles.quantityButton}
                  onClick={() => removeFromCart(item.id)}
                >
                  -
                </button>
                <button 
                  style={styles.quantityButton}
                  onClick={() => addToCart(item)}
                >
                  +
                </button>
              </div>
            })}
            <h4 style={styles.total}>Total: ${calculateTotal().toFixed(2)}</h4>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart;
