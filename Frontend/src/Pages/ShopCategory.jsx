import React, { useContext } from "react";
import "./CSS/ShopCategory.css";
import { ShopContext } from "../Context/ShopContext";
import dropdown_icon from "../Components/Assets/dropdown_icon.png";
import Item from "../Components/Item/Item";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext); // ✅ FIXED
  const filteredProducts =
    all_product?.filter((item) => item.category === props.category) || [];

  return (
    <div className="shop-category">
      <img className="shopcategory-banner" src={props.banner} alt="" />

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{filteredProducts.length}</span> Out of{" "}
          {filteredProducts.length} Products
        </p>

        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {all_product
          .filter((item) => item.category === props.category) // ✅ CLEAN FILTER
          .map((item) => (
            <Item
              key={item._id}
              id={item._id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))}
      </div>

      <div className="shopcategory-loadmore">Explore More</div>
    </div>
  );
};

export default ShopCategory;
