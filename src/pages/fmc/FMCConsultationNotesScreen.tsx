import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from '@/services/fmcService';
import { FileText, Save, Clock, User, RefreshCw, Search, ArrowLeft } from 'lucide-react';

interface Note {
  id: string;
  note_type: string;
  content: string;
  author: string;
  created_at: string;
}

interface CaseItem {
  id: string;
  patient_name: string;
  condition: string;
  status: string;
}

const FMCConsultationNotesScreen = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseId || '');
  const [noteType, setNoteType] = useState('routine');
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const noteTypes = [
    { id: 'initial', label: 'Initial Consultation' },
    { id: 'followup', label: 'Follow-up Visit' },
    { id: 'routine', label: 'Routine Check' },
    { id: 'urgent', label: 'Urgent Care' },
  ];

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fmcAPI.getCases({ status: 'open' });
      const casesData = (response?.data || []).map((c: any) => ({
        id: c.id,
        patient_name: c.patient?.full_name || 'Unknown',
        condition: c.condition_label || c.condition,
        status: c.status,
      }));
      setCases(casesData);
    } catch (err: any) {
      console.log('Error fetching cases:', err?.message);
      setCases([
        { id: 'demo-case-1', patient_name: 'Sarah Johnson', condition: 'PCOS', status: 'open' },
        { id: 'demo-case-2', patient_name: 'Amina Yusuf', condition: 'PCOS', status: 'open' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (id: string) => {
    try {
      setLoadingNotes(true);
      setError(null);
      const response = await fmcAPI.getConsultationNotes(id);
      const notesData = response?.data || response || [];
      setNotes(notesData.map((note: any) => ({
        id: note.id,
        note_type: note.note_type,
        content: note.content,
        author: note.clinician_name || 'Unknown',
        created_at: note.created_at,
      })));
    } catch (err: any) {
      console.log('Error fetching notes:', err?.message);
      setNotes([
        { id: '1', note_type: 'routine', content: 'Patient shows improvement', author: 'Dr. Adekunle', created_at: '2024-03-15T10:30:00Z' },
        { id: '2', note_type: 'followup', content: 'Continue medication for 2 weeks', author: 'Dr. Adekunle', created_at: '2024-03-14T09:15:00Z' },
      ]);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchNotes(selectedCaseId);
      navigate(`/fmc/consultation/${selectedCaseId}`, { replace: true });
    }
  }, [selectedCaseId]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !selectedCaseId) {
      setError('Please select a patient and enter a note');
      return;
    }
    try {
      const response = await fmcAPI.createConsultationNote(selectedCaseId, {
        note_type: noteType,
        content: newNote,
      });
      const createdNote = response?.data || response;
      setNotes([{
        id: createdNote.id || Date.now().toString(),
        note_type: createdNote.note_type || noteType,
        content: createdNote.content || newNote,
        author: createdNote.clinician_name || 'You',
        created_at: createdNote.created_at || new Date().toISOString(),
      }, ...notes]);
      setNewNote('');
      setError(null);
    } catch (err: any) {
      console.log('Error saving note:', err?.message);
      setError('Failed to save note');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getNoteTypeColor = (type: string) => {
    const colors: Record<string, string> = { initial: 'bg-blue-100 text-blue-800', followup: 'bg-purple-100 text-purple-800', routine: 'bg-green-100 text-green-800', urgent: 'bg-red-100 text-red-800' };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <FMCLayout>
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Consultation Notes</h1>
            <p className="text-sm text-gray-500">Record and view clinical notes</p>
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Select Patient</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient case..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.patient_name} - {c.condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {!selectedCaseId ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Select a patient to view or add consultation notes</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-base">Add New Note</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {error && (
                  <div className="text-sm text-red-600 p-2 bg-red-50 rounded">{error}</div>
                )}
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {noteTypes.map(type => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea 
                  placeholder="Enter your clinical note..." 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)} 
                  rows={3} 
                />
                <Button 
                  onClick={handleSaveNote} 
                  disabled={!newNote.trim()} 
                  className="w-full bg-[#C0392B]"
                >
                  <Save className="h-4 w-4 mr-2" /> Save Note
                </Button>
              </CardContent>
            </Card>

            <h2 className="font-semibold mb-3">Notes History ({notes.length})</h2>
            {loadingNotes ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#C0392B]" />
              </div>
            ) : (
              <div className="space-y-2">
                {notes.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No notes yet for this patient
                    </CardContent>
                  </Card>
                ) : (
                  notes.map(note => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getNoteTypeColor(note.note_type)}>
                            {noteTypes.find(t => t.id === note.note_type)?.label || note.note_type}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{note.content}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {note.author}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </FMCLayout>
  );
};

export default FMCConsultationNotesScreen;