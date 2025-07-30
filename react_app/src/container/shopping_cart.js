/*

Requirements:
* Display a list of products with name, price, and "Add to Cart" button [ code: done, review: pending]
* Show a cart summary with added items and total
* Implement quantity adjustment in cart
* Calculate and display total price [code: Done, review: pending]
* Add remove item functionality [ code: Done, review: pending]
* Handle empty cart state

*/

import React, { useEffect, useState } from "react";
const ShoppingCart = () => {
  const products = [
    { id: 1, name: "Product 1", price: 29.99 },
    { id: 2, name: "Product 2", price: 39.99 },
    { id: 3, name: "Product 3", price: 19.99 }
  ];

  /* state declaration & management */
  const [cart, setCart] = useState([]);

  useEffect(() => {
    console.log(" products ", products)
  }, [])
  /* Functions */
  // Add to Cart
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

  // remove from Cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      // if one item left
      if (existingItem.quantity === 1) {
        return prevCart.filter((item) => item.id !== productId)
      }
      // otherwise
      return prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  // caclualte TotalPrice
  const calculateTotal = () => {
    return cart.reduce((total, item) =>
      total + item.price * item.quantity, 0);
  };

  /* hooks */

  return (
    <div>
      <h4> Shopping Cart </h4>

      {/* display products */}
      <h4> Products</h4>
      <div>
        {products.map((product) => {
          return <div key={product.id}>
            <p>{product.name}</p>
            <p> ${product.price.toFixed(2)}</p>
            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>

          </div>

        })}
      </div>

      {/* cart summary  */}
      <h4> Cart Summary </h4>
      <h4> Cart </h4>
      {cart.length === 0 ? (<p> Empty Cart </p>) :
        (
          <div>
            {cart.map((item) => {
              return <div key={item.id} style={{ padding: '3px', marginTop: '5px' }}>
                <p>{item.name}</p>
                <p>Price: ${item.price.toFixed(2)} | quantity: {item.quantity}</p>
                <button onClick={() => removeFromCart(item.id)}> - </button>
                <button onClick={() => addToCart(item)}> + </button>
              </div>
            })}
            {/* Total */}
            <h4> Total  $ {calculateTotal().toFixed(2)}</h4>

          </div>
        )
      }

    </div>
  )

}
export default ShoppingCart;
