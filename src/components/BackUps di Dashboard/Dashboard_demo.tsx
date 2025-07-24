// Full English version with aligned checkbox and all filters
import React, { useEffect, useState } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Listbox } from '@headlessui/react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

interface Certification {
  _id: string;
  nome: string;
  cognome: string;
  azienda: string;
  email: string;
  jobRole: string;
  dataCertificazione: string;
  tipoCertificazione: string;
  country: string;
  customer: string;
  deliveryModel: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Dashboard = () => {
  const [data, setData] = useState<Certification[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const allOption = "All";

  useEffect(() => {
    fetch('http://localhost:4000/api/certifications')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  const uniqueCountries = Array.from(new Set(data.map(d => d.country))).sort();
  const uniqueYears = Array.from(new Set(data.map(d => new Date(d.dataCertificazione).getFullYear()))).sort();

  const handleCountryChange = (countries: string[]) => {
    if (countries.includes(allOption)) {
      if (selectedCountries.includes(allOption)) {
        setSelectedCountries([]);
      } else {
        setSelectedCountries([allOption, ...uniqueCountries]);
      }
    } else {
      setSelectedCountries(countries.filter(c => c !== allOption));
    }
  };

  const toggleSelection = (value: number, list: number[], setList: (val: number[]) => void) => {
    setList(
      list.includes(value) ? list.filter(v => v !== value) : [...list, value]
    );
  };

  const filteredData = data.filter(record => {
    const recordDate = new Date(record.dataCertificazione);
    const matchesCountry = selectedCountries.includes(allOption) || selectedCountries.length === 0 || selectedCountries.includes(record.country);
    const matchesYear = selectedYears.length === 0 || selectedYears.includes(recordDate.getFullYear());
    const matchesMonth = selectedMonths.length === 0 || selectedMonths.includes(recordDate.getMonth());
    return matchesCountry && matchesYear && matchesMonth;
  });

  const certificationsByType = filteredData.reduce((acc, curr) => {
    acc[curr.tipoCertificazione] = (acc[curr.tipoCertificazione] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(certificationsByType).map(([type, count]) => ({
    tipoCertificazione: type,
    count
  }));

  const totalCerts = filteredData.length;
  const onshoreCerts = filteredData.filter(d => d.deliveryModel === 'Onshore').length;
  const offshoreCerts = filteredData.filter(d => d.deliveryModel === 'Offshore').length;

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-400">MongoDB × Accenture Dashboard - DEMO with Dummy Data</h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Total Certifications</h3>
          <p className="text-2xl">{totalCerts}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Onshore</h3>
          <p className="text-2xl">{onshoreCerts}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Offshore</h3>
          <p className="text-2xl">{offshoreCerts}</p>
        </div>
      </div>

      {/* Country Filter */}
      <div className="mb-6 max-w-md">
        <label className="block text-sm text-gray-300 mb-2">Filter by Country:</label>
        <Listbox value={selectedCountries} onChange={handleCountryChange} multiple>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white text-black py-2 pl-3 pr-10 text-left shadow-md sm:text-sm">
              <span className="block truncate">
                {selectedCountries.length > 0 ? selectedCountries.join(', ') : 'Select one or more countries'}
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
              {[allOption, ...uniqueCountries].map((country) => (
                <Listbox.Option key={country} value={country} className="relative cursor-pointer select-none py-2 pl-10 pr-4">
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {country}
                      </span>
                      {selected ? <span className="absolute left-2 top-2"><CheckIcon className="h-5 w-5 text-green-600" aria-hidden="true" /></span> : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Year Filter */}
      <div className="mb-4">
        <h3 className="text-gray-300 mb-1">Filter by Year:</h3>
        <div className="flex flex-wrap gap-2">
          {uniqueYears.map(year => (
            <button
              key={year}
              className={`px-4 py-2 rounded ${selectedYears.includes(year) ? 'bg-green-600' : 'bg-gray-700'} hover:bg-green-500`}
              onClick={() => toggleSelection(year, selectedYears, setSelectedYears)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Filter */}
      <div className="mb-6">
        <h3 className="text-gray-300 mb-1">Filter by Month:</h3>
        <div className="flex flex-wrap gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              className={`px-4 py-2 rounded ${selectedMonths.includes(index) ? 'bg-green-600' : 'bg-gray-700'} hover:bg-green-500`}
              onClick={() => toggleSelection(index, selectedMonths, setSelectedMonths)}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-4 rounded shadow mb-8">
        <h2 className="text-xl mb-4 font-semibold">Certifications by Type</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="tipoCertificazione" stroke="#d1d5db" />
            <YAxis stroke="#d1d5db" />
            <Tooltip />
            <Bar dataKey="count" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg shadow border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">First Name</th>
              <th className="px-4 py-2 text-left">Last Name</th>
              <th className="px-4 py-2 text-left">Company</th>
              <th className="px-4 py-2 text-left">Job Role</th>
              <th className="px-4 py-2 text-left">Certification Type</th>
              <th className="px-4 py-2 text-left">Country</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Delivery Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredData.map((record) => (
              <tr key={record._id}>
                <td className="px-4 py-2">{record.nome}</td>
                <td className="px-4 py-2">{record.cognome}</td>
                <td className="px-4 py-2">{record.azienda}</td>
                <td className="px-4 py-2">{record.jobRole}</td>
                <td className="px-4 py-2">{record.tipoCertificazione}</td>
                <td className="px-4 py-2">{record.country}</td>
                <td className="px-4 py-2">{record.customer}</td>
                <td className="px-4 py-2">{record.deliveryModel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;