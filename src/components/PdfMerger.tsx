import React, { useState, useEffect } from 'react';
import { FileUp, File as FileIcon, X, Eye } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { SectionButton } from './SectionButton';

interface PDFFile {
  id: string;
  name: string;
  file: File;
  pages: number;
  previewUrl: string;
}

export function PdfMerger() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPdfFiles: PDFFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pageCount = pdfDoc.getPageCount();

          newPdfFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            file: file,
            pages: pageCount,
            previewUrl: URL.createObjectURL(file),
          });
        } catch (error) {
          console.error('Error loading PDF:', error);
        }
      }
    }

    setPdfFiles([...pdfFiles, ...newPdfFiles]);
    e.target.value = '';
  };

  const removePdf = (id: string) => {
    const fileToRemove = pdfFiles.find((pdf) => pdf.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setPdfFiles(pdfFiles.filter((pdf) => pdf.id !== id));
  };

  const mergePdfs = async () => {
    if (pdfFiles.length === 0) return;

    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMergedPdf = () => {
    if (!mergedPdfUrl) return;

    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = 'merged-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetApp = () => {
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
    pdfFiles.forEach((pdf) => URL.revokeObjectURL(pdf.previewUrl));
    setMergedPdfUrl(null);
    setPdfFiles([]);
  };

  useEffect(() => {
    return () => {
      pdfFiles.forEach((pdf) => URL.revokeObjectURL(pdf.previewUrl));
      if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-black border border-neutral-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">PDF Merger</h1>
          <p className="text-slate-400">Select multiple PDFs to merge them into one document</p>
        </div>

        {!mergedPdfUrl ? (
          <>
            <div className="mb-6">
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer bg-slate-800/30 hover:bg-black hover:border-slate-500 transition-all group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
                  <p className="mb-2 text-sm text-slate-300">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">PDF files only</p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {pdfFiles.length > 0 && (
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  Selected Files ({pdfFiles.length})
                </h3>
                {pdfFiles.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {pdf.name}
                        </p>
                        <p className="text-xs text-slate-500">{pdf.pages} pages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewPdf(pdf.previewUrl)}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors group/preview"
                        title="Preview PDF"
                      >
                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                      </button>
                      <button
                        onClick={() => removePdf(pdf.id)}
                        className="p-1 hover:bg-red-500/20 rounded-full transition-colors group/remove"
                        title="Remove PDF"
                      >
                        <X className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pdfFiles.length > 0 && (
              <div className="flex justify-center mt-6">
                <SectionButton
                  onClick={mergePdfs}
                  disabled={isMerging}
                  text={isMerging ? "Merging..." : "Merge PDFs"}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                <FileIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                PDFs Merged Successfully!
              </h3>
              <p className="text-sm text-slate-400 mb-1">
                {pdfFiles.length} PDFs merged into one document
              </p>
              <p className="text-xs text-slate-500">
                Total pages: {pdfFiles.reduce((acc, pdf) => acc + pdf.pages, 0)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
              <SectionButton
                onClick={downloadMergedPdf}
                text="Download PDF"
              />

              <SectionButton
                onClick={resetApp}
                text="Merge Again"
              />
            </div>
          </div>
        )}
      </div>

      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100">PDF Preview</h3>
              <button
                onClick={() => setPreviewPdf(null)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <iframe
                src={previewPdf}
                className="w-full h-full rounded-lg bg-white"
                title="PDF Preview"
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewPdf(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors font-medium border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
