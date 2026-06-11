import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Edit, Trash2, CheckCircle, XCircle,
  AlertTriangle, Package, User, Calendar, Clock
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";

interface MedEntry {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface RxRecord {
  id: string;
  patient: string;
  patient_name?: string;
  medications: MedEntry[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MappedRx {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  medication: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

const ClinicianPatientPrescriptionsScreen = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('Patient');
  const [prescriptions, setPrescriptions] = useState<MappedRx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rxRes, casesRes] = await Promise.all([
        clinicianAPI.getPrescriptions(),
        clinicianAPI.getMyCases(),
      ]);

      // Resolve patient name from cases
      const matchCase = (casesRes.data || []).find((c: any) => c.patient?.id === patientId);
      if (matchCase) setPatientName(matchCase.patient?.full_name || 'Patient');

      // Filter prescriptions for this patient
      const filtered = (rxRes.data || [])
        .filter((p: any) => String(p.patient_id) === String(patientId))
        .map((p: RxRecord) => ({
          id: p.id,
          medication: p.medications?.[0]?.name || 'Unnamed medication',
          dosage: p.medications?.[0]?.dosage || '',
          frequency: p.medications?.[0]?.frequency || '',
          duration: p.medications?.[0]?.duration || '',
          instructions: p.medications?.[0]?.instructions || '',
          is_active: p.is_active,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));

      setPrescriptions(filtered);
    } catch {
      setError('Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [patientId]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (rx: MappedRx) => {
    setEditingId(rx.id);
    setFormData({
      medication: rx.medication,
      dosage: rx.dosage,
      frequency: rx.frequency,
      duration: rx.duration,
      instructions: rx.instructions,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.medication.trim()) {
      setError('Medication name is required.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        patient_id: patientId,
        medications: [{
          name: formData.medication,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration,
          instructions: formData.instructions,
        }],
      };
      if (editingId) {
        await clinicianAPI.updatePrescription(editingId, payload);
      } else {
        await clinicianAPI.createPrescription(payload);
      }
      setIsDialogOpen(false);
      setError(null);
      await fetchAll();
    } catch {
      setError(editingId ? 'Failed to update prescription.' : 'Failed to create prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      await clinicianAPI.deletePrescription(id);
      await fetchAll();
    } catch {
      setError('Failed to delete prescription.');
    }
  };

  const handleToggleActive = async (rx: MappedRx) => {
    try {
      await clinicianAPI.updatePrescription(rx.id, { is_active: !rx.is_active });
      await fetchAll();
    } catch {
      setError('Failed to update status.');
    }
  };

  const activeRx = prescriptions.filter(rx => rx.is_active);
  const inactiveRx = prescriptions.filter(rx => !rx.is_active);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/clinician/prescriptions')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{patientName}</h1>
                <p className="text-xs text-gray-500">
                  {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
                  {activeRx.length > 0 && <span className="text-green-600 ml-2">· {activeRx.length} active</span>}
                </p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Prescription
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {prescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-700 mb-1">No prescriptions for {patientName}</h3>
              <p className="text-sm text-gray-500 mb-4">Add their first prescription below.</p>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Prescription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active prescriptions */}
            {activeRx.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Active ({activeRx.length})
                </h2>
                <div className="space-y-3">
                  {activeRx.map((rx, i) => (
                    <RxCard
                      key={rx.id}
                      rx={rx}
                      index={i}
                      onEdit={() => openEdit(rx)}
                      onDelete={() => handleDelete(rx.id)}
                      onToggle={() => handleToggleActive(rx)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive prescriptions */}
            {inactiveRx.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Inactive ({inactiveRx.length})
                </h2>
                <div className="space-y-3">
                  {inactiveRx.map((rx, i) => (
                    <RxCard
                      key={rx.id}
                      rx={rx}
                      index={i}
                      onEdit={() => openEdit(rx)}
                      onDelete={() => handleDelete(rx.id)}
                      onToggle={() => handleToggleActive(rx)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Prescription' : `New Prescription for ${patientName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Medication name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.medication}
                onChange={(e) => setFormData(p => ({ ...p, medication: e.target.value }))}
                placeholder="e.g. Metformin"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dosage</Label>
                <Input
                  value={formData.dosage}
                  onChange={(e) => setFormData(p => ({ ...p, dosage: e.target.value }))}
                  placeholder="e.g. 500mg"
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Input
                  value={formData.frequency}
                  onChange={(e) => setFormData(p => ({ ...p, frequency: e.target.value }))}
                  placeholder="e.g. Twice daily"
                />
              </div>
            </div>
            <div>
              <Label>Duration</Label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 30 days"
              />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData(p => ({ ...p, instructions: e.target.value }))}
                placeholder="Take with food, avoid alcohol..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Prescription'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Prescription card sub-component
const RxCard = ({
  rx, index, onEdit, onDelete, onToggle
}: {
  rx: MappedRx;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
  >
    <Card className={`border-l-4 ${rx.is_active ? 'border-l-green-500' : 'border-l-gray-300'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Package className={`h-5 w-5 mt-0.5 shrink-0 ${rx.is_active ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-gray-900">{rx.medication}</h3>
                <Badge className={rx.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                  {rx.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mt-2">
                {rx.dosage && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dosage</span>
                    <span className="font-medium text-gray-700">{rx.dosage}</span>
                  </div>
                )}
                {rx.frequency && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frequency</span>
                    <span className="font-medium text-gray-700">{rx.frequency}</span>
                  </div>
                )}
                {rx.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-medium text-gray-700">{rx.duration}</span>
                  </div>
                )}
              </div>
              {rx.instructions && (
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2">{rx.instructions}</p>
              )}
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Prescribed {new Date(rx.created_at).toLocaleDateString()}
                {rx.updated_at !== rx.created_at && (
                  <span className="ml-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(rx.updated_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onEdit}>
              <Edit className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`h-7 text-xs ${rx.is_active ? 'text-gray-500' : 'text-green-600 border-green-300'}`}
              onClick={onToggle}
            >
              {rx.is_active
                ? <><XCircle className="h-3 w-3 mr-1" /> Deactivate</>
                : <><CheckCircle className="h-3 w-3 mr-1" /> Activate</>}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ClinicianPatientPrescriptionsScreen;