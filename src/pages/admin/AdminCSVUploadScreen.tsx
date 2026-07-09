import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, FileText, Loader2, CheckCircle, AlertCircle, X, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { lgaAPI } from '@/services/lgaService';

interface CsvResult {
  total_rows: number;
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

const AdminCSVUploadScreen = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CsvResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selected);
      setError('');
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (!dropped.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      if (dropped.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(dropped);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await lgaAPI.uploadFacilitiesCsv(formData);
      const data = res?.data || res;
      setResult({
        total_rows: data.total_rows ?? 0,
        created: data.created ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? [],
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to upload file. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/system-admin/facilities?tab=all')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CSV Upload</h1>
            <p className="text-sm text-gray-500">Bulk upload health facilities via CSV</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Facilities CSV
            </CardTitle>
            <CardDescription>
              Upload a CSV file containing health facility data. Max file size: 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!file ? (
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Drag and drop your CSV file here</p>
                <p className="text-xs text-gray-400 mb-3">or click to browse</p>
                <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload
                  </Button>
                  <Button variant="ghost" size="icon" onClick={removeFile} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {result && (
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Upload Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{result.total_rows}</p>
                      <p className="text-xs text-gray-500">Total Rows</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">{result.created}</p>
                      <p className="text-xs text-green-600">Created</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-700">{result.skipped}</p>
                      <p className="text-xs text-yellow-600">Skipped</p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {result.errors.length} error{result.errors.length > 1 ? 's' : ''} encountered:
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
                        {result.errors.map((err, i) => (
                          <p key={i} className="text-xs text-red-700">
                            <span className="font-medium">Row {err.row}:</span> {err.reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => { setResult(null); }}
                  >
                    Upload Another File
                  </Button>
                </CardContent>
              </Card>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">CSV Format</p>
              <p className="text-xs text-gray-500 mb-2">
                The CSV should include the following columns:
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 font-mono">
                <span>name</span><span>facility_type</span>
                <span>address</span><span>phone_number</span>
                <span>email</span><span>latitude</span>
                <span>longitude</span><span>lga</span>
                <span>state</span><span>zone</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCSVUploadScreen;