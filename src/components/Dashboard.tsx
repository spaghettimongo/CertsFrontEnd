// Enhanced MongoDB Dashboard with advanced charts and interactive world map
import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend
} from 'recharts';

interface Certification {
  _id: string;
  FirstName: string;
  LastName: string;
  Company: string;
  Email: string;
  JobRole: string;
  CertificationDate: string;
  CertificationType: string;
  Country: string;
  Customer: string;
  DeliveryModel: string;
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

const GlobalIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
  </svg>
);

// Country coordinates for the world map visualization
const CountryCoordinates: Record<string, { x: number; y: number; name: string }> = {
  'USA': { x: 150, y: 120, name: 'United States' },
  'Canada': { x: 120, y: 80, name: 'Canada' },
  'UK': { x: 320, y: 100, name: 'United Kingdom' },
  'Germany': { x: 340, y: 110, name: 'Germany' },
  'France': { x: 320, y: 120, name: 'France' },
  'Italy': { x: 340, y: 140, name: 'Italy' },
  'Spain': { x: 300, y: 140, name: 'Spain' },
  'India': { x: 450, y: 160, name: 'India' },
  'China': { x: 480, y: 120, name: 'China' },
  'Japan': { x: 520, y: 130, name: 'Japan' },
  'Australia': { x: 520, y: 220, name: 'Australia' },
  'Brazil': { x: 200, y: 200, name: 'Brazil' },
  'Mexico': { x: 100, y: 160, name: 'Mexico' },
  'Argentina': { x: 180, y: 260, name: 'Argentina' },
  'South Africa': { x: 360, y: 240, name: 'South Africa' },
  'Russia': { x: 420, y: 80, name: 'Russia' },
  'Netherlands': { x: 335, y: 105, name: 'Netherlands' },
  'Sweden': { x: 350, y: 80, name: 'Sweden' },
  'Norway': { x: 340, y: 70, name: 'Norway' },
  'Poland': { x: 360, y: 105, name: 'Poland' }
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const Dashboard = () => {
  const [data, setData] = useState<Certification[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [CountryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  
  // Editable titles state
  const [titles, setTitles] = useState({
    mainTitle: "MongoDB Certifications Dashboard",
    subtitle: "Certification Analytics & Insights",
    totalCertsTitle: "Total Certifications",
    onshoreTitle: "Onshore Delivery",
    offshoreTitle: "Offshore Delivery",
    chartTitle: "Certifications by Type",
    pieChartTitle: "Delivery Model Distribution",
    trendChartTitle: "Certification Trends Over Time",
    mapTitle: "Global Certification Distribution",
    topCountriesTitle: "Top 10 Countries by Certifications",
    tableTitle: "Certification Records",
    CountryFilterTitle: "Filter by Country",
    yearFilterTitle: "Filter by Year",
    monthFilterTitle: "Filter by Month"
  });
  
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  
  const allOption = "All";

 useEffect(() => {
  fetch(`${import.meta.env.VITE_API_BASE_URL}/data`)
    .then(res => res.json())
    .then(json => {
      console.log('✅ Dati ricevuti:', json); // <--- AGGIUNGI QUESTO
      setData(json);
    });
}, []);


  const uniqueCountries = Array.from(new Set(data.map(d => d.Country))).sort();
  const uniqueYears = Array.from(new Set(data.map(d => new Date(d.CertificationDate).getFullYear()))).sort();

  const handleCountryChange = (Country: string) => {
    if (Country === allOption) {
      if (selectedCountries.includes(allOption)) {
        setSelectedCountries([]);
      } else {
        setSelectedCountries([allOption, ...uniqueCountries]);
      }
    } else {
      const newSelected = selectedCountries.includes(Country)
        ? selectedCountries.filter(c => c !== Country && c !== allOption)
        : [...selectedCountries.filter(c => c !== allOption), Country];
      setSelectedCountries(newSelected);
    }
  };

  const toggleSelection = (value: number, list: number[], setList: (val: number[]) => void) => {
    setList(
      list.includes(value) ? list.filter(v => v !== value) : [...list, value]
    );
  };

  const filteredData = data.filter(record => {
    const recordDate = new Date(record.CertificationDate);
    const matchesCountry = selectedCountries.includes(allOption) || selectedCountries.length === 0 || selectedCountries.includes(record.Country);
    const matchesYear = selectedYears.length === 0 || selectedYears.includes(recordDate.getFullYear());
    const matchesMonth = selectedMonths.length === 0 || selectedMonths.includes(recordDate.getMonth());
    return matchesCountry && matchesYear && matchesMonth;
  });

  const certificationsByType = filteredData.reduce((acc, curr) => {
    acc[curr.CertificationType] = (acc[curr.CertificationType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(certificationsByType).map(([type, count]) => ({
    CertificationType: type,
    count
  }));

  // Pie chart data for delivery models
  const deliveryModelData = filteredData.reduce((acc, curr) => {
    acc[curr.DeliveryModel] = (acc[curr.DeliveryModel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(deliveryModelData).map(([model, count]) => ({
    name: model,
    value: count
  }));

  // Trend data by month
  const trendData = months.map((month, index) => {
    const count = filteredData.filter(record => 
      new Date(record.CertificationDate).getMonth() === index
    ).length;
    return {
      month: month.slice(0, 3),
      certifications: count,
      onshore: filteredData.filter(record => 
        new Date(record.CertificationDate).getMonth() === index && record.DeliveryModel === 'Onshore'
      ).length,
      offshore: filteredData.filter(record => 
        new Date(record.CertificationDate).getMonth() === index && record.DeliveryModel === 'Offshore'
      ).length
    };
  });

  // Country data for map and top countries
  const CountryData = filteredData.reduce((acc, curr) => {
    acc[curr.Country] = (acc[curr.Country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountriesData = Object.entries(CountryData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([Country, count]) => ({ Country, count }));

  const totalCerts = filteredData.length;
  const onshoreCerts = filteredData.filter(d => d.DeliveryModel === 'Onshore').length;
  const offshoreCerts = filteredData.filter(d => d.DeliveryModel === 'Offshore').length;

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
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-10 shadow-2xl relative z-40">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
            Filters & Controls
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Country Filter */}
            <div className="relative z-50">
              <EditableTitle
                titleKey="CountryFilterTitle"
                value={titles.CountryFilterTitle}
                defaultClassName="block text-sm font-semibold text-gray-300 mb-3"
              />
              <div className="relative">
                <button
                  onClick={() => setCountryDropdownOpen(!CountryDropdownOpen)}
                  className="relative w-full cursor-pointer rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 hover:border-green-400 transition-colors py-3 pl-4 pr-10 text-left shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white flex items-center justify-between"
                >
                  <span className="block truncate">
                    {selectedCountries.length > 0 ? selectedCountries.join(', ') : 'Select countries...'}
                  </span>
                  <ChevronDownIcon />
                </button>
                {CountryDropdownOpen && (
                  <div className="absolute z-[9999] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-gray-800 border border-gray-600 text-white py-2 shadow-2xl">
                    {[allOption, ...uniqueCountries].map((Country) => (
                      <div
                        key={Country}
                        onClick={() => handleCountryChange(Country)}
                        className="relative cursor-pointer select-none py-3 pl-10 pr-4 hover:bg-gray-700 transition-colors"
                      >
                        <span className={`block truncate ${selectedCountries.includes(Country) ? 'font-semibold text-green-400' : 'font-normal'}`}>
                          {Country}
                        </span>
                        {selectedCountries.includes(Country) && (
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

        {/* Main Chart Section */}
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

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
          {/* Pie Chart */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <EditableTitle
              titleKey="pieChartTitle"
              value={titles.pieChartTitle}
              defaultClassName="text-2xl font-bold text-white mb-6 flex items-center gap-3"
            />
            <div className="bg-gray-900/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <EditableTitle
              titleKey="trendChartTitle"
              value={titles.trendChartTitle}
              defaultClassName="text-2xl font-bold text-white mb-6 flex items-center gap-3"
            />
            <div className="bg-gray-900/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOnshore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorOffshore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#d1d5db" fontSize={12} />
                  <YAxis stroke="#d1d5db" fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Area type="monotone" dataKey="onshore" stackId="1" stroke="#3b82f6" fill="url(#colorOnshore)" />
                  <Area type="monotone" dataKey="offshore" stackId="1" stroke="#f59e0b" fill="url(#colorOffshore)" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Interactive World Map and Top Countries */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mb-10">
          {/* Interactive World Map */}
          <div className="xl:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <GlobalIcon />
              <EditableTitle
                titleKey="mapTitle"
                value={titles.mapTitle}
                defaultClassName="text-2xl font-bold text-white"
              />
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6">
              <div className="relative w-full h-80 bg-gray-800 rounded-lg overflow-hidden">
                {/* Simplified World Map SVG */}
                <svg viewBox="0 0 600 300" className="w-full h-full">
                  {/* World map background */}
                  <rect width="600" height="300" fill="#1f2937" />
                  
                  {/* Simplified continents */}
                  <path d="M100 80 Q120 60 180 80 Q220 90 250 120 Q280 140 320 130 Q360 120 400 140 Q450 160 500 150 Q550 140 580 160 L580 220 Q550 240 500 230 Q450 240 400 220 Q360 210 320 220 Q280 230 250 210 Q220 200 180 210 Q120 220 100 200 Z" fill="#374151" opacity="0.6" />
                  <path d="M50 100 Q80 90 120 110 Q160 120 200 150 Q240 180 280 170 Q320 160 360 180 Q400 200 440 190 Q480 180 520 200 Q560 220 580 240 L580 280 L50 280 Z" fill="#374151" opacity="0.4" />
                  
                  {/* Country dots */}
                  {Object.entries(CountryData).map(([Country, count]) => {
                    const coords = CountryCoordinates[Country];
                    if (!coords) return null;
                    
                    const radius = Math.max(4, Math.min(20, count * 3));
                    const isHovered = hoveredCountry === Country;
                    
                    return (
                      <g key={Country}>
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={radius}
                          fill={isHovered ? "#34d399" : "#10b981"}
                          opacity={isHovered ? 1 : 0.8}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="cursor-pointer transition-all duration-200 hover:scale-110"
                          onMouseEnter={() => setHoveredCountry(Country)}
                          onMouseLeave={() => setHoveredCountry(null)}
                        />
                        {isHovered && (
                          <text
                            x={coords.x}
                            y={coords.y - radius - 8}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="12"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {coords.name}: {count}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="mt-4 text-sm text-gray-400 text-center">
                Hover over the dots to see certification counts by Country
              </div>
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <EditableTitle
              titleKey="topCountriesTitle"
              value={titles.topCountriesTitle}
              defaultClassName="text-2xl font-bold text-white mb-6 flex items-center gap-3"
            />
            <div className="space-y-4">
              {topCountriesData.map((item, index) => (
                <div key={item.Country} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                      'bg-gradient-to-r from-gray-600 to-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">{item.Country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / Math.max(...topCountriesData.map(d => d.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-green-400 font-bold text-sm w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{record.FirstName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{record.LastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.Company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.JobRole}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {record.CertificationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.Country}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.Customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.DeliveryModel === 'Onshore' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.DeliveryModel}
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

