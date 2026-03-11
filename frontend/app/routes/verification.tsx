import { useState } from 'react';
import { MdCloudUpload, MdCheckCircle, MdCancel } from 'react-icons/md';

export default function Verification() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/faces/verify', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ match: false, message: 'Error verifying face' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold text-gray-800">Face Verification</h1>
      <p className="text-gray-600 mt-2">Upload a photo to verify identity</p>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Photo</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <MdCloudUpload className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
            </label>
          </div>
          
          {preview && (
            <div className="mt-6">
              <img src={preview} alt="Preview" className="w-full rounded-xl shadow-lg" />
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full mt-4 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify Face'}
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Result</h2>
          
          {!result ? (
            <div className="text-center py-12 text-gray-500">
              <p>Upload and verify a photo to see results</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                result.match ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {result.match ? (
                  <MdCheckCircle className="text-3xl text-emerald-600" />
                ) : (
                  <MdCancel className="text-3xl text-red-600" />
                )}
                <div>
                  <h3 className={`font-semibold text-lg ${
                    result.match ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {result.match ? 'Match Found' : 'No Match'}
                  </h3>
                  <p className={`text-sm ${
                    result.match ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
              
              {result.match && (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Person Name</p>
                    <p className="text-lg font-semibold text-gray-800">{result.person_name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Person ID</p>
                    <p className="text-lg font-semibold text-gray-800">{result.person_id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Confidence Score</p>
                    <p className="text-lg font-semibold text-gray-800">{result.confidence}%</p>
                  </div>
                </div>
              )}
              
              {!result.match && result.confidence && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Best Match Confidence</p>
                  <p className="text-lg font-semibold text-gray-800">{result.confidence}%</p>
                  <p className="text-xs text-gray-500 mt-1">Threshold: 65% (Higher accuracy)</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
