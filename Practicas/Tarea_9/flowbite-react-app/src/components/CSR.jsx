// src/components/CSR.jsx
import React, { useState, useEffect } from 'react';

const CSR = () => {
  const [dogImage, setDogImage] = useState('');

  useEffect(() => {
    fetchDogImage();
  }, []);

  const fetchDogImage = async () => {
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await response.json();
    setDogImage(data.message);
  };

  return (
    <div>
      <h1>Client Side Rendering</h1>
      <img src={dogImage} alt="A Random Dog" />
      <button onClick={fetchDogImage}>
        ¡Otro!
      </button>
    </div>
  );
};

export default CSR;
