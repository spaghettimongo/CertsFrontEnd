
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/api/certifications')
      .then(res => {
        setData(res.data);
        console.log("✅ Dati ricevuti:", res.data);
      })
      .catch(err => console.error("Errore nel caricamento dati:", err));
  }, []);

  const certificationsByType = Object.entries(
    data.reduce((acc, curr) => {
      if (!curr.tipoCertificazione) return acc;
      acc[curr.tipoCertificazione] = (acc[curr.tipoCertificazione] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const deliveryModelData = ['onshore', 'offshore'].map(mode => ({
    name: mode,
    value: data.filter(item => item.deliveryModel?.toLowerCase() === mode).length
  }));

  const certificationsByMonth = Object.entries(
    data.reduce((acc, curr) => {
      if (!curr.dataCertificazione) return acc;
      const date = new Date(curr.dataCertificazione);
      if (isNaN(date.getTime())) return acc;
      const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-10">
      <p className="text-red-600 font-bold text-xl">🚧 VERSIONE COMPLETA CON GRAFICI ATTIVI</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Certificazioni per Tipo</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={certificationsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Onshore vs Offshore</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={deliveryModelData} dataKey="value" nameKey="name" outerRadius={80} label>
                {deliveryModelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d'][index % 2]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow col-span-2">
          <h2 className="text-lg font-semibold mb-2">Certificazioni per Mese</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={certificationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-lg font-bold mb-2">Tabella Certificazioni</p>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Nome</th>
            <th className="border px-4 py-2">Cognome</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Tipo Certificazione</th>
            <th className="border px-4 py-2">Data Certificazione</th>
            <th className="border px-4 py-2">Delivery Model</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cert, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{cert.nome}</td>
              <td className="border px-4 py-2">{cert.cognome}</td>
              <td className="border px-4 py-2">{cert.email}</td>
              <td className="border px-4 py-2">{cert.tipoCertificazione}</td>
              <td className="border px-4 py-2">{cert.dataCertificazione?.slice(0, 10)}</td>
              <td className="border px-4 py-2">{cert.deliveryModel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
