// Enhanced MongoDB Dashboard with advanced charts and interactive world map
import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Area, AreaChart, Legend
} from 'recharts';

// Campi aggiornati da MongoDB Atlas
interface Certification {
  _id: string;
  FirstName: string;
  LastName: string;
  Company: string;
  Email: string;
  JobRole: string;
  CertificationType: string;
  CertificationDate: string;
  Country: string;
  Customer: string;
  DeliveryModel: string;
}

const Dashboard = () => {
  const [data, setData] = useState<Certification[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/data`)
      .then(res => res.json())
      .then(json => {
        console.log('✅ Dati ricevuti:', json);
        setData(json);
      });
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Certifications Loaded: {data.length}</h1>
      <ul className="space-y-2">
        {data.map((record, index) => (
          <li key={record._id || index} className="bg-gray-800 p-4 rounded shadow">
            <p><strong>{record.FirstName} {record.LastName}</strong> – {record.CertificationType}</p>
            <p>{record.Company}, {record.Country} – {record.DeliveryModel}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
