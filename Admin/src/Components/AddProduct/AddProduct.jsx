import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import { useState } from "react";

const AddProduct = () => {
  const [image, setImage] = useState(null);

  const [productDetails, setProductDetails] = useState({
    name: "",
    category: "Women",
    new_price: "",
    old_price: "",
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({
      ...productDetails,
      [e.target.name]: e.target.value,
    });
  };

  const Add_Product = async () => {
    try {
      if (!image) {
        alert("Please select an image");
        return;
      }

      // 🔹 1. Upload image
      const formData = new FormData();
      formData.append("product", image);

      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        alert("Image upload failed");
        return;
      }

      // 🔹 2. Prepare product (IMPORTANT FIXES HERE)
      const product = {
        name: productDetails.name,
        category: productDetails.category,
        image: uploadData.image_url, // ✅ FULL IMAGE URL
        new_price: Number(productDetails.new_price), // ✅ NUMBER
        old_price: Number(productDetails.old_price), // ✅ NUMBER
      };

      // 🔹 3. Add product
      const productRes = await fetch(
        `${import.meta.env.VITE_API_URL}/addproduct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );

      const productData = await productRes.json();

      if (productData.success) {
        alert("Product Added Successfully ✅");

        // reset form
        setProductDetails({
          name: "",
          category: "Women",
          new_price: "",
          old_price: "",
        });
        setImage(null);
      } else {
        alert("Failed to add product ❌");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          type="text"
          name="name"
          value={productDetails.name}
          onChange={changeHandler}
          placeholder="Type here"
        />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Old Price</p>
          <input
            type="text"
            name="old_price"
            value={productDetails.old_price}
            onChange={changeHandler}
            placeholder="Type here"
          />
        </div>

        <div className="addproduct-itemfield">
          <p>New Price</p>
          <input
            type="text"
            name="new_price"
            value={productDetails.new_price}
            onChange={changeHandler}
            placeholder="Type here"
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          name="category"
          value={productDetails.category}
          onChange={changeHandler}
          className="add-product-selector"
        >
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Kids">Kids</option>
          <option value="Decoration">Decoration</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            alt=""
            className="addproduct-thumbnail-img"
          />
        </label>
        <input type="file" id="file-input" hidden onChange={imageHandler} />
      </div>

      <button onClick={Add_Product} className="addproduct-btn">
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
