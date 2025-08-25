import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = () => {
  const [newCollections, setNewCollections] = useState([]);

  useEffect(()=>{
    fetch('http://localhost:5000/newcollections')
    .then((response)=>response.json())
    .then((data)=>setNewCollections(data));
  },[])

  useEffect(() => {
    const fetchNewCollections = async () => {
      try {
        const response = await fetch('http://localhost:5000/newcollections');
        const data = await response.json();
        setNewCollections(data);
      } catch (error) {
        console.error("Failed to fetch new collections:", error);
      }
    };

    fetchNewCollections();
  }, []);

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {newCollections.length > 0 ? (
          newCollections.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p>No new collections available.</p>
        )}
      </div>
    </div>
  );
};

export default NewCollections;
