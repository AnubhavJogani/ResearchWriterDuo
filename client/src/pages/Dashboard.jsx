import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modeIsOpen, setModeIsOpen] = useState(false);
  const [refineDetails, setRefineDetails] = useState('');
  const [id, setId] = useState(null);
  const [postModeIsOpen, setPostModeIsOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTerm }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`Server status: ${response.status}`);

      const json = await response.json();
      setData(json.result);
      setId(json.id);
    } catch (error) {
      console.error("Fetch failed:", error);
      alert("Check if your backend is running on port 3001!");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    setModeIsOpen(false);
    try {
      const response = await fetch(`${API_BASE}/api/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, feedback: refineDetails }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Server status: ${response.status}`);
      const json = await response.json();
      setData(json.refinedReport);
      setModeIsOpen(false);
    } catch (error) {
      console.error("Refine failed:", error);
      alert("Refine failed. Please try again.");
    }
  }

  const handleCreatePost = async () => {
    setPostModeIsOpen(false);
    try {
      const response = await fetch(`${API_BASE}/api/createPost`, {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Server status: ${response.status}`);
      const json = await response.json();
      setData(json.postContent);
    } catch (error) {
      console.error("Create post failed:", error);
      alert("Create post failed. Please try again.");
    }
  }


  return (
    <div className='flex flex-col items-center min-h-screen w-full p-8 bg-gray-50'>
      <h1 className='text-3xl font-bold mb-8'>AI Researcher</h1>

      <div className='flex gap-4 w-full max-w-2xl'>
        <input
          type="text"
          className='border-2 border-gray-300 rounded-md p-2 grow outline-none focus:border-blue-500'
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
        <>
        <div className='mt-8 p-8 bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-4xl prose lg:prose-xl'>
          <Markdown>{data}</Markdown>
        </div>
        <div className='flex flex-row gap-4 m-10'>
          <button className='bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 px-6 transition-colors disabled:bg-gray-400' 
          onClick={() => setModeIsOpen(true)}>
            Refine
          </button>
          <button className='bg-green-600 hover:bg-green-700 text-white rounded-md p-2 px-6 transition-colors disabled:bg-gray-400' 
          onClick={() => setPostModeIsOpen(true)}>
            Create Post
            </button>
        </div>
        </>
      )}


      {
        modeIsOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
              <h2 className='text-2xl font-bold mb-4'>Refine Research</h2>
              <p className='mb-4'>This is where you can add more details to refine your research results.</p>
              <textarea
                className='w-full h-32 border-2 border-gray-300 rounded-md p-2 mb-4 outline-none focus:border-blue-500'
                placeholder='Add more details...'
                value={refineDetails}
                onChange={(e) => setRefineDetails(e.target.value)}
              />
              <button className='bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 px-6 transition-colors mr-4' onClick={handleRefine}>
                Refine
              </button>
              <button className='bg-red-600 hover:bg-red-700 text-white rounded-md p-2 px-6 transition-colors' onClick={() => setModeIsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )
      }
      {
        postModeIsOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
              <h2 className='text-2xl font-bold mb-4'>Create Post</h2>
              <p className='mb-4'>This is where you can create a post based on your research results.</p>
              <button className='bg-green-600 hover:bg-green-700 text-white rounded-md p-2 px-6 transition-colors mr-4' onClick={handleCreatePost}>
                Create Post
              </button>
              <button className='bg-red-600 hover:bg-red-700 text-white rounded-md p-2 px-6 transition-colors' onClick={() => setPostModeIsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default Dashboard;