import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let i = 0; i <= 300; i++) {
    cart[i] = { quantity: 0, size: "" };
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [wishlistItems, setWishlistItems] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("auth-token"));

  // Load products
  useEffect(() => {
    fetch("http://localhost:5000/allproducts")
      .then((res) => res.json())
      .then((data) => setAll_Product(data))
      .catch((err) => console.error("Product fetch error:", err));
  }, []);

  // Handle cart persistence
  useEffect(() => {
    if (token) {
      // Fetch user cart from server
      fetch("http://localhost:5000/getcart", {
        method: "POST",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch cart");
          return res.json();
        })
        .then((serverCartData) => {
          // Safely parse local cart
          let localCart = {};
          try {
            const localCartString = localStorage.getItem('guest_cart');
            localCart = localCartString ? JSON.parse(localCartString) : {};
          } catch (e) {
            console.error("Error parsing local cart:", e);
            localCart = {};
          }
          
          // Merge carts (server cart takes precedence)
          const mergedCart = { ...localCart, ...(serverCartData.cartData || {}) };
          setCartItems(mergedCart);
          
          // Update server with any local cart items
          if (Object.keys(localCart).length > 0) {
            Object.entries(localCart).forEach(([itemId, itemData]) => {
              if (itemData?.quantity > 0) {
                fetch("http://localhost:5000/addtocart", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                  },
                  body: JSON.stringify({ 
                    itemId, 
                    size: itemData.size || "" 
                  }),
                }).catch(err => console.error("Cart merge error:", err));
              }
            });
            localStorage.removeItem('guest_cart');
          }
        })
        .catch((err) => {
          console.error("Cart fetch error:", err);
          // Fallback to local cart if server fails
          try {
            const localCartString = localStorage.getItem('guest_cart');
            if (localCartString) {
              setCartItems(JSON.parse(localCartString));
            }
          } catch (e) {
            console.error("Error parsing local cart:", e);
          }
        });

      // Fetch wishlist
      fetch("http://localhost:5000/getwishlist", {
        method: "POST",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch wishlist");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) setWishlistItems(data);
        })
        .catch((err) => {
          console.error("Wishlist fetch error:", err);
          setWishlistItems([]);
        });
    } else {
      // For guest users, load from localStorage
      try {
        const localCartString = localStorage.getItem('guest_cart');
        if (localCartString) {
          setCartItems(JSON.parse(localCartString));
        }
      } catch (e) {
        console.error("Error parsing local cart:", e);
        setCartItems(getDefaultCart());
      }
    }
  }, [token]);

  // Save guest cart to localStorage when it changes
  useEffect(() => {
    if (!token) {
      try {
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.error("Error saving cart to localStorage:", e);
      }
    }
  }, [cartItems, token]);

  const addToCart = (itemId, size) => {
    const updatedCart = {
      ...cartItems,
      [itemId]: {
        quantity: cartItems[itemId]?.quantity ? cartItems[itemId].quantity + 1 : 1,
        size: size || cartItems[itemId]?.size || "",
      },
    };
    
    setCartItems(updatedCart);

    if (token) {
      fetch("http://localhost:5000/addtocart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId, size: size || "" }),
      }).catch((err) => console.error("Add to cart API error:", err));
    }
  };

  const removeFromCart = (itemId) => {
    const newQty = cartItems[itemId]?.quantity ? cartItems[itemId].quantity - 1 : 0;
    const updatedCart = {
      ...cartItems,
      [itemId]: newQty > 0 ? { ...cartItems[itemId], quantity: newQty } : { quantity: 0, size: "" },
    };
    
    setCartItems(updatedCart);

    if (token) {
      fetch("http://localhost:5000/removefromcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId }),
      }).catch((err) => console.error("Remove from cart API error:", err));
    }
  };

  const addToWishlist = (itemId) => {
    if (!wishlistItems.includes(itemId)) {
      const updated = [...wishlistItems, itemId];
      setWishlistItems(updated);
      if (token) {
        fetch("http://localhost:5000/addtowishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({ itemId }),
        }).catch((err) => console.error("Add to wishlist error:", err));
      }
    }
  };

  const removeFromWishlist = (itemId) => {
    const updated = wishlistItems.filter(id => id !== itemId);
    setWishlistItems(updated);
    if (token) {
      fetch("http://localhost:5000/removefromwishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId }),
      }).catch((err) => console.error("Remove from wishlist error:", err));
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("auth-token");
    setToken(null);
    // Only reset cart if user was authenticated
    if (token) {
      setCartItems(getDefaultCart());
      setWishlistItems([]);
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item]?.quantity > 0) {
        const product = all_product.find((p) => p.id === Number(item));
        if (product) total += cartItems[item]?.quantity * product.new_price;
      }
    }
    return total;
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce(
      (acc, item) => acc + (item?.quantity || 0),
      0
    );
  };

  const contextValue = {
    all_product,
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    getTotalCartAmount,
    getTotalCartItems,
    logoutUser,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;