import React, { useEffect, useState } from "react";
import "./NewCollection.css";
import Item from "../Item/Item";

const NewCollections = () => {
  const [new_collection, setNewCollection] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/newcollections`)
      .then((res) => res.json())
      .then((data) => setNewCollection(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="new-collections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default NewCollections;
