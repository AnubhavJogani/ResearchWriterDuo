import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Markdown from 'react-markdown';
import { LogOut, History, Cpu, Sparkles, Send, RefreshCw, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import { Search, ArrowBigRight, ArrowBigLeft} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [modeIsOpen, setModeIsOpen] = useState(false);
  const [postModeIsOpen, setPostModeIsOpen] = useState(false);
  const [refineDetails, setRefineDetails] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [displayData, setDisplayData] = useState(null);
  const [postModeDetails, setPostModeDetails] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const isGuest = localStorage.getItem('isGuest') === 'true';

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history || []);
        console.log("Fetched history:", json);
      }
    } catch (err) { console.error("History fetch failed", err); }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
      localStorage.clear();
      navigate('/login');
    } catch (err) { navigate('/login'); }
  };

  const handleGeneratePost = async () => {
    setLoading(true);

    setPostModeIsOpen(false);
    try {
      const response = await fetch(`${API_BASE}/api/createPost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.id, requirements: postModeDetails }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Server status: ${response.status}`);
      const json = await response.json();
      setData((prev) => ({ ...prev, final_post: json.final_post, steps: json.steps }));
      setCurrentStep(json.steps);
      setDisplayData(json.final_post);
      setLoading(false);
    } catch (err) {
      console.error("Post generation failed", err);
      alert("Post generation failed. Please try again.");
      setLoading(false);
    }
  }

  const handleRefine = async () => {
    setLoading(true);
    setModeIsOpen(false)
    try {
      const response = await fetch(`${API_BASE}/api/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: refineDetails, id: data.id }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Server status: ${response.status}`);
      const json = await response.json();
      setData(() => ({ ...data, steps: json.steps, refined_report: json.refined_report }));
      setCurrentStep(2);
      setDisplayData(json.refined_report);
      fetchHistory();
    } catch (error) {
      console.error("Refinement failed:", error);
      alert("Refinement failed. Please try again.");
    } finally { setLoading(false); }
  }

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
      setData(json);
      setCurrentStep(1);
      setDisplayData(json.raw_report);
      fetchHistory();
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally { setLoading(false); }
  };

  const handleNextStep = () => {
    if (currentStep < data.steps) {
      if (currentStep === 1) {
      setDisplayData(data.refined_report);
      } else if (currentStep === 2) {
        setDisplayData(data.final_post);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 2) {
        setDisplayData(data.raw_report);
      } else if (currentStep === 3) {
        setDisplayData(data.refined_report);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-[10px] font-black tracking-[0.2em] text-cyan-500 uppercase flex items-center gap-2">
            <History size={14} /> RESEARCH_HISTORY
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <button
            key={'NEW_SEARCH'}
            onClick={() => {
              setData(null);
            }}
            className="flex w-full text-left text-[11px] p-3 rounded-lg bg-slate-800 border border-transparent hover:border-slate-700 transition-all items-center justify-center"
          >
            <Search size={14} className="mr-2" />
            <span className="text-cyan-400">New Search</span>
          </button>
          {history.length > 0 ? history.map((item) => (
            <button
              key={item.id}
              onClick={() => { setData(item); setCurrentStep(item.steps); setDisplayData(item.final_report || item.refined_report || item.raw_report);
              }}
              className="w-full text-left text-[11px] p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all truncate group"
            >
              <span className="text-slate-500 group-hover:text-cyan-400 mr-2">#</span>
              {item.topic || 'Untitled_Agent_Run'}
            </button>
          )) : (
            <div className="text-center py-10 opacity-20">
              <FileText size={32} className="mx-auto mb-2" />
              <p className="text-[9px] uppercase tracking-widest">No Logs Found</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="p-6 border-t border-slate-800 flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={16} /> TERMINATE_SESSION
        </button>
      </div>

      <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">

        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8">
          <div className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tighter ${isGuest ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'}`}>
            {isGuest ? 'Status: Guest_Mode' : 'Status: Authorized_User'}
          </div>
          { data &&
          <div className="flex justify-center gap-4">
            {currentStep < 3 &&<button onClick={() => setModeIsOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-2.5 rounded-xl text-xs font-bold transition-all">
              <RefreshCw size={14} /> REFINE_REPORT
            </button>}
            {currentStep > 1 && <button onClick={() => setPostModeIsOpen(true)} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-900/20">
              <Sparkles size={14} /> GENERATE_POST
            </button>}
          </div> }
        </header>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center ">
          <div className="w-full max-w-3xl space-y-8">

            {data ? (
              <div className='flex items-center justify-between text-slate-500'>
                <div className="relative flex items-center justify-center p-5 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:text-slate-300 transition-colors" onClick={handlePrevStep}>
                  <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition"></div>
                  <ArrowBigLeft size={24} className="text-slate-500" />
                </div>
                <div>Step {currentStep}</div>
                <div>
                  <div className="relative flex items-center justify-center p-5 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:text-slate-300 transition-colors" onClick={handleNextStep}>
                    <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition"></div>
                  <ArrowBigRight size={24} className="text-slate-500" />
                  </div>
                </div>
              </div>
            ) : (<div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition"></div>
              <input
                type="text"
                className="relative w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 pl-14 text-sm focus:outline-none focus:border-cyan-500 transition-all"
                placeholder="Enter research parameters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Cpu className="absolute left-5 top-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" size={24} />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-3 top-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-30"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>)}

            {data ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 prose prose-invert prose-cyan max-w-none shadow-2xl">
                  <Markdown>{displayData}</Markdown>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-900 rounded-3xl opacity-30">
                <Sparkles size={40} className="mb-4" />
                <p className="text-[10px] uppercase tracking-[0.3em]">Awaiting Command Trace</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* REFINE MODAL */}
      <Modal
        isOpen={modeIsOpen}
        onClose={() => setModeIsOpen(false)}
        title="Refine_Report"
        footer={
          <>
            <button
              onClick={() => setModeIsOpen(false)}
              className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleRefine}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-lg uppercase transition-all"
            >
              Execute_Refinement
            </button>
          </>
        }
      >
        <textarea
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500 min-h-[120px]"
          placeholder="Specify focus areas or corrections..."
          value={refineDetails}
          onChange={(e) => setRefineDetails(e.target.value)}
        />
      </Modal>

      {/* POST MODE MODAL */}
      <Modal
        isOpen={postModeIsOpen}
        onClose={() => setPostModeIsOpen(false)}
        title="Create_LinkedIn_Post"
        footer={
          <>
            <button
              onClick={() => setPostModeIsOpen(false)}
              className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePost}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-lg uppercase transition-all"
            >
              Generate_Post
            </button>
          </>
        }
      >
        <textarea
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500 min-h-[120px]"
          placeholder="Specify post-processing requirements if any..."
          value={postModeDetails}
          onChange={(e) => setPostModeDetails(e.target.value)}
        />
      </Modal>
      <LoadingScreen isLoading={loading} />

    </div>
  );
};

export default Dashboard;