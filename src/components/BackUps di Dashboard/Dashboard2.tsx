// Modern MongoDB Dashboard with editable titles and enhanced UI
import React, { useEffect, useState } from 'react';
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

// Custom SVG Icons
const CheckIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const PencilIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const Dashboard = () => {
  const [data, setData] = useState<Certification[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  
  // Editable titles state
  const [titles, setTitles] = useState({
    mainTitle: "MongoDB × Accenture Dashboard",
    subtitle: "Certification Analytics & Insights",
    totalCertsTitle: "Total Certifications",
    onshoreTitle: "Onshore Delivery",
    offshoreTitle: "Offshore Delivery",
    chartTitle: "Certifications by Type",
    tableTitle: "Certification Records",
    countryFilterTitle: "Filter by Country",
    yearFilterTitle: "Filter by Year",
    monthFilterTitle: "Filter by Month"
  });
  
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  
  const allOption = "All";

  useEffect(() => {
    fetch('http://localhost:4000/api/certifications')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  const uniqueCountries = Array.from(new Set(data.map(d => d.country))).sort();
  const uniqueYears = Array.from(new Set(data.map(d => new Date(d.dataCertificazione).getFullYear()))).sort();

  const handleCountryChange = (country: string) => {
    if (country === allOption) {
      if (selectedCountries.includes(allOption)) {
        setSelectedCountries([]);
      } else {
        setSelectedCountries([allOption, ...uniqueCountries]);
      }
    } else {
      const newSelected = selectedCountries.includes(country)
        ? selectedCountries.filter(c => c !== country && c !== allOption)
        : [...selectedCountries.filter(c => c !== allOption), country];
      setSelectedCountries(newSelected);
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

  const startEdit = (titleKey: string, currentValue: string) => {
    setEditingTitle(titleKey);
    setTempTitle(currentValue);
  };

  const saveTitle = (titleKey: string) => {
    setTitles(prev => ({ ...prev, [titleKey]: tempTitle }));
    setEditingTitle(null);
  };

  const cancelEdit = () => {
    setEditingTitle(null);
    setTempTitle("");
  };

  const EditableTitle = ({ titleKey, value, className, defaultClassName }: {
    titleKey: string;
    value: string;
    className?: string;
    defaultClassName: string;
  }) => (
    <div className="group relative inline-flex items-center gap-2">
      {editingTitle === titleKey ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            className="bg-gray-800 border border-green-400 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle(titleKey);
              if (e.key === 'Escape') cancelEdit();
            }}
            autoFocus
          />
          <button
            onClick={() => saveTitle(titleKey)}
            className="text-green-400 hover:text-green-300 text-sm font-medium"
          >
            Save
          </button>
          <button
            onClick={cancelEdit}
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <h1 className={className || defaultClassName}>{value}</h1>
          <button
            onClick={() => startEdit(titleKey, value)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
            title="Edit title"
          >
            <PencilIcon />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300684A' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-4">
            <EditableTitle
              titleKey="mainTitle"
              value={titles.mainTitle}
              defaultClassName="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg"
            />
          </div>
          <EditableTitle
            titleKey="subtitle"
            value={titles.subtitle}
            defaultClassName="text-xl text-gray-300 font-light tracking-wide"
          />
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border border-gray-700 hover:border-green-400 transition-all duration-300 rounded-2xl p-6 shadow-2xl hover:shadow-green-400/10 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <EditableTitle
                titleKey="totalCertsTitle"
                value={titles.totalCertsTitle}
                defaultClassName="text-lg font-semibold text-gray-300 mb-3"
              />
              <p className="text-4xl font-bold text-white mb-2">{totalCerts.toLocaleString()}</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border border-gray-700 hover:border-blue-400 transition-all duration-300 rounded-2xl p-6 shadow-2xl hover:shadow-blue-400/10 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <EditableTitle
                titleKey="onshoreTitle"
                value={titles.onshoreTitle}
                defaultClassName="text-lg font-semibold text-gray-300 mb-3"
              />
              <p className="text-4xl font-bold text-white mb-2">{onshoreCerts.toLocaleString()}</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full" style={{width: `${totalCerts > 0 ? (onshoreCerts/totalCerts)*100 : 0}%`}}></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border border-gray-700 hover:border-amber-400 transition-all duration-300 rounded-2xl p-6 shadow-2xl hover:shadow-amber-400/10 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <EditableTitle
                titleKey="offshoreTitle"
                value={titles.offshoreTitle}
                defaultClassName="text-lg font-semibold text-gray-300 mb-3"
              />
              <p className="text-4xl font-bold text-white mb-2">{offshoreCerts.toLocaleString()}</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full" style={{width: `${totalCerts > 0 ? (offshoreCerts/totalCerts)*100 : 0}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-10 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
            Filters & Controls
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Country Filter */}
            <div>
              <EditableTitle
                titleKey="countryFilterTitle"
                value={titles.countryFilterTitle}
                defaultClassName="block text-sm font-semibold text-gray-300 mb-3"
              />
              <div className="relative">
                <button
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="relative w-full cursor-pointer rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 hover:border-green-400 transition-colors py-3 pl-4 pr-10 text-left shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white flex items-center justify-between"
                >
                  <span className="block truncate">
                    {selectedCountries.length > 0 ? selectedCountries.join(', ') : 'Select countries...'}
                  </span>
                  <ChevronDownIcon />
                </button>
                {countryDropdownOpen && (
                  <div className="absolute z-[9999] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-gray-800 border border-gray-600 text-white py-2 shadow-2xl">
                    {[allOption, ...uniqueCountries].map((country) => (
                      <div
                        key={country}
                        onClick={() => handleCountryChange(country)}
                        className="relative cursor-pointer select-none py-3 pl-10 pr-4 hover:bg-gray-700 transition-colors"
                      >
                        <span className={`block truncate ${selectedCountries.includes(country) ? 'font-semibold text-green-400' : 'font-normal'}`}>
                          {country}
                        </span>
                        {selectedCountries.includes(country) && (
                          <span className="absolute left-3 top-3 text-green-400">
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <EditableTitle
                titleKey="yearFilterTitle"
                value={titles.yearFilterTitle}
                defaultClassName="text-sm font-semibold text-gray-300 mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {uniqueYears.map(year => (
                  <button
                    key={year}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedYears.includes(year) 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                    onClick={() => toggleSelection(year, selectedYears, setSelectedYears)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Filter */}
            <div>
              <EditableTitle
                titleKey="monthFilterTitle"
                value={titles.monthFilterTitle}
                defaultClassName="text-sm font-semibold text-gray-300 mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedMonths.includes(index) 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                    onClick={() => toggleSelection(index, selectedMonths, setSelectedMonths)}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-10 shadow-2xl">
          <EditableTitle
            titleKey="chartTitle"
            value={titles.chartTitle}
            defaultClassName="text-2xl font-bold text-white mb-6 flex items-center gap-3"
          />
          <div className="bg-gray-900/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="tipoCertificazione" 
                  stroke="#d1d5db" 
                  fontSize={12}
                  tick={{ fill: '#d1d5db' }}
                />
                <YAxis 
                  stroke="#d1d5db" 
                  fontSize={12}
                  tick={{ fill: '#d1d5db' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-700">
            <EditableTitle
              titleKey="tableTitle"
              value={titles.tableTitle}
              defaultClassName="text-2xl font-bold text-white flex items-center gap-3"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                <tr>
                  {[
                    'First Name', 'Last Name', 'Company', 'Job Role', 
                    'Certification Type', 'Country', 'Customer', 'Delivery Model'
                  ].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredData.map((record, index) => (
                  <tr key={record._id} className={`hover:bg-gray-700/50 transition-colors ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-900/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{record.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{record.cognome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.azienda}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.jobRole}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {record.tipoCertificazione}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.deliveryModel === 'Onshore' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.deliveryModel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;