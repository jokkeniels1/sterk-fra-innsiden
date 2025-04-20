import { useEffect, useState } from 'react';
import { testPDFGeneration } from '../utils/pdfGenerator';

export default function TestPDF() {
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        setStatus('generating');
        console.log('Starting PDF generation test...');
        const result = await testPDFGeneration();
        if (result) {
          setStatus('success');
          console.log('PDF generated successfully!');
        } else {
          setStatus('error');
          setError('Failed to generate PDF');
          console.error('PDF generation failed');
        }
      } catch (err) {
        setStatus('error');
        setError(err.message);
        console.error('Error during PDF generation:', err);
      }
    };

    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">PDF Generator Test</h1>
      
      {status === 'initializing' && (
        <p className="mb-4">Initializing PDF generator...</p>
      )}
      
      {status === 'generating' && (
        <p className="mb-4">Generating PDF, please wait...</p>
      )}
      
      {status === 'success' && (
        <>
          <p className="mb-4 text-green-400">PDF generated successfully!</p>
          <p className="mb-4">Please check your downloads folder for "test-kostholdsplan.pdf".</p>
        </>
      )}
      
      {status === 'error' && (
        <>
          <p className="mb-4 text-red-400">Error generating PDF:</p>
          <p className="mb-4 text-red-400">{error}</p>
        </>
      )}
      
      <p className="text-sm text-gray-400">Check the browser console for detailed logs.</p>
    </div>
  );
} 