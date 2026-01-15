import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState({});

  /* ================= FETCH PRODUCTS & CART ================= */
  useEffect(() => {
    const abortController = new AbortController();

    // 🔹 Fetch all products
    fetch(`${process.env.REACT_APP_API_URL}/allproducts`, {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data) => setAll_Product(data))
      .catch((err) => console.error("Products Fetch Error:", err));

    // 🔹 Fetch cart if logged in
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
        .then((res) => res.json())
        .then((data) => setCartItems(data))
        .catch((err) => console.error("Cart Fetch Error:", err));
    }

    return () => abortController.abort();
  }, []);

  /* ================= ADD TO CART ================= */
  const addToCart = (itemId) => {
    if (!itemId) return;

    // 🔹 Update local cart
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    // 🔹 Update backend cart
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
        .then((res) => {
          if (!res.ok) throw new Error("Add to cart failed");
          return res.json();
        })
        .catch((err) => console.error("Add Cart Error:", err));
    }
  };

  /* ================= REMOVE FROM CART ================= */
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev };
      if (updatedCart[itemId] > 1) {
        updatedCart[itemId] -= 1;
      } else {
        delete updatedCart[itemId];
      }
      return updatedCart;
    });
  };

  /* ================= TOTAL CART AMOUNT ================= */
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const product = all_product.find((item) => item._id === itemId);
      if (product) {
        totalAmount += product.new_price * cartItems[itemId];
      }
    }

    return totalAmount;
  };

  /* ================= TOTAL CART ITEMS ================= */
  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, qty) => total + qty, 0);
  };

  /* ================= CONTEXT VALUE ================= */
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
