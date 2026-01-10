import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 301; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    const abortController = new AbortController();

    // ✅ GET ALL PRODUCTS
    fetch(`${process.env.REACT_APP_API_URL}/allproducts`, {
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch products");
        return response.json();
      })
      .then((data) => setAll_Product(data))
      .catch((error) => console.error("Products Fetch Error:", error));

    // ✅ GET CART
    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL}/getcart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": localStorage.getItem("auth-token"),
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch cart");
          return response.json();
        })
        .then((data) => setCartItems(data))
        .catch((error) => console.error("Cart Fetch Error:", error));
    }

    return () => abortController.abort();
  }, []);

  // ✅ ADD TO CART
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] + 1,
    }));

    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL}/addtocart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": localStorage.getItem("auth-token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Add to cart failed");
          return response.json();
        })
        .then((data) => console.log("Added to cart:", data))
        .catch((error) => console.error("Add Cart Error:", error));
    }
  };

  // ✅ REMOVE FROM CART
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : 0,
    }));
  };

  // ✅ TOTAL AMOUNT
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // ✅ TOTAL ITEMS
  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce(
      (acc, count) => acc + (count > 0 ? count : 0),
      0
    );
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
