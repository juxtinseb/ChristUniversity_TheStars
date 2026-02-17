import { useEffect, useState } from "react";

function Home() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/resources")
      .then(res => res.json())
      .then(data => setResources(data));
  }, []);

  return (
    <div>
      <h2>Resources</h2>

      {resources.map((item, index) => (
        <div key={index}>
          <h3>{item.title}</h3>
          <p>{item.subject}</p>
          <p>{item.semester}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
