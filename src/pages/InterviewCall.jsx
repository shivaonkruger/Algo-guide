import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { SignedIn, UserButton } from '@clerk/clerk-react';

// TODO: Replace with your actual Vapi public API key and assistant ID
const VAPI_PUBLIC_API_KEY = '781364f1-e4f2-4434-8717-8f56758bcdf8';
const VAPI_ASSISTANT_ID = 'a19d890c-f51a-40e5-b0bd-5ae806713aef';

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`text-center group cursor-pointer py-2 px-3 rounded-lg transition ${active ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

export default function InterviewCall() {
  const [callActive, setCallActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [latestQuestion, setLatestQuestion] = useState('');
  const [code, setCode] = useState('');
  const vapiRef = useRef(null);

  // Initialize Vapi only once
  if (!vapiRef.current) {
    vapiRef.current = new Vapi(VAPI_PUBLIC_API_KEY);
    vapiRef.current.on('call-start', () => {
      setStatus('Interview started');
      setCallActive(true);
    });
    vapiRef.current.on('call-end', () => {
      setStatus('Interview ended');
      setCallActive(false);
    });
    vapiRef.current.on('message', (message) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, { role: message.role, text: message.transcript }]);
      }
    });
  }

  useEffect(() => {
    // Find the latest agent message that looks like a coding question
    const lastAgentMsg = [...transcript].reverse().find(
      msg => msg.role === 'agent' && /question|solve|implement|write|code/i.test(msg.text)
    );
    setLatestQuestion(lastAgentMsg ? lastAgentMsg.text : '');
  }, [transcript]);

  const startConversation = () => {
    setTranscript([]);
    setStatus('Starting interview...');
    vapiRef.current.start(VAPI_ASSISTANT_ID);
  };

  const endConversation = () => {
    setStatus('Ending interview...');
    vapiRef.current.stop();
  };

  const restartInterview = () => {
    vapiRef.current.stop();
    setTranscript([]);
    setCode('');
    setLatestQuestion('');
    setStatus('Restarting interview...');
    setTimeout(() => {
      vapiRef.current.start(VAPI_ASSISTANT_ID);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar - always visible */}
      <div className="w-20 bg-gray-800 fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center py-6 border-r border-gray-700">
        <div className="mb-8">
          <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl">
            AG
          </div>
        </div>
        <nav className="flex-1 space-y-4">
          <NavItem icon="📚" label="Course" />
          <NavItem icon="📝" label="Blogs" />
          <NavItem icon="🎤" label="Interview" active />
          <NavItem icon="📊" label="Dashboard" />
        </nav>
        <div className="space-y-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* Main Interview Content - add left margin to avoid sidebar overlap */}
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ marginLeft: '5rem' }}>
        <h1 className="text-3xl font-bold mb-6">Interview Voice Agent</h1>
        <div className="mb-4">
          <button
            className={`px-6 py-3 rounded-lg font-semibold mr-4 ${callActive ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={startConversation}
            disabled={callActive}
          >
            Start Conversation
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold mr-4 ${!callActive ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            onClick={restartInterview}
            disabled={!callActive}
          >
            Restart Interview
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold ${!callActive ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
            onClick={endConversation}
            disabled={!callActive}
          >
            End Conversation
          </button>
        </div>
        <div className="mb-4 text-lg font-medium">Status: {status}</div>
        <div className="w-full max-w-xl bg-gray-800 rounded-lg p-6 mt-4">
          <h2 className="text-xl font-bold mb-2">Transcript</h2>
          <div className="h-64 overflow-y-auto text-sm bg-gray-900 rounded p-2 flex flex-col gap-2">
            {transcript.length === 0 ? (
              <div className="text-gray-500">No transcript yet.</div>
            ) : (
              transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs break-words shadow-md ${
                      msg.role === 'agent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    <span className="font-semibold mr-2">
                      {msg.role === 'agent' ? 'Interviewer:' : 'You:'}
                    </span>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coding window appears when there's a question */}
        {latestQuestion && (
          <div className="fixed right-0 top-0 h-full w-[40vw] min-w-[350px] bg-gray-800 border-l border-gray-700 p-6 flex flex-col z-50">
            <h2 className="text-lg font-bold mb-4 text-orange-400">Coding Question</h2>
            <div className="mb-4 text-white font-medium bg-gray-900 rounded p-3 shadow">{latestQuestion}</div>
            <textarea
              className="flex-1 w-full bg-gray-900 text-white rounded p-3 font-mono text-sm border border-gray-700 focus:outline-none focus:border-orange-500 resize-none"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Write your code here..."
              rows={16}
            />
            <button
              className="mt-4 px-6 py-2 bg-orange-500 rounded-lg text-white font-semibold hover:bg-orange-600 transition self-end"
              onClick={() => alert('Code submitted! (implement backend to handle this)')}
            >
              Submit Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
