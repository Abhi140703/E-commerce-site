import React, { useContext } from "react";
import { ShopContext } from "../Context/ShopContext";
import { useParams } from "react-router-dom";
import Breadcrum from "../Components/Breadcrum/Breadcrum";
import ProductDisplay from "../Components/ProductDisplay/ProductDisplay";
import DescriptionBox from "../Components/DescriptionBox/DescriptionBox";
import RelatedProducts from "../Components/RelatedProducts/RelatedProducts";
import LoadingPopup from "../Components/LoadingPopup";

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();

  // (_id is a string)
  const product = all_product.find((e) => e._id === productId);

  // SHOW POPUP WHILE PRODUCT LOADS
  if (!product) {
    return (
      <LoadingPopup message="Please wait, product is loading. This may take a moment." />
    );
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox />
      <RelatedProducts />
    </div>
  );
};

export default Product;
