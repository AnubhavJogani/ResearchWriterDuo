import React, { useState } from 'react';
import Markdown from 'react-markdown';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTerm })
      });

      if (!response.ok) throw new Error(`Server status: ${response.status}`);

      const json = await response.json();
      setData(json.result);
    } catch (error) {
      console.error("Fetch failed:", error);
      alert("Check if your backend is running on port 3001!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center min-h-screen w-full p-8 bg-gray-50'>
      <h1 className='text-3xl font-bold mb-8'>AI Researcher</h1>

      <div className='flex gap-4 w-full max-w-2xl'>
        <input
          type="text"
          className='border-2 border-gray-300 rounded-md p-2 flex-grow outline-none focus:border-blue-500'
          placeholder='Enter Research Topic'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          disabled={loading}
          className='bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 px-6 transition-colors disabled:bg-gray-400'
          onClick={handleSearch}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {data && (
        <div className='mt-8 p-8 bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-4xl prose lg:prose-xl'>
          <Markdown>{data}</Markdown>
        </div>
      )}
    </div>
  );
};

export default Dashboard;