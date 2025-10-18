import React, { useState, useEffect } from "react";

const AyahText = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.alquran.cloud/v1/ayah/262");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  console.log(data);

  return (
    <div
      style={{
        fontFamily: "AlQalam",
        fontSize: "2rem",
        width: "500px",
        margin: "0 auto",
        border: "1px solid black",
      }}
    >
      {data.data.text}
    </div>
  );
};

export default AyahText;
