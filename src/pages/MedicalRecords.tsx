/**
 * HealthWallet Nigeria - Medical Records Page
 */

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Camera,
  Search,
  Filter,
  ExternalLink,
  Check,
  X,
  Loader2,
  RotateCcw,
  Trash2,
  Pencil,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { recordsApi } from '@/services/api';
import type { MedicalRecord, RecordType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { InlineLoader } from '@/components/common/HealthLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

const recordTypeLabels: Record<RecordType, string> = {
  PRESCRIPTION: 'Prescription',
  LAB_RESULT: 'Lab Result',
  VACCINE: 'Vaccine',
};

const recordTypeColors: Record<RecordType, string> = {
  PRESCRIPTION: 'bg-primary/10 text-primary',
  LAB_RESULT: 'bg-secondary/10 text-secondary',
  VACCINE: 'bg-success/10 text-success',
};

export const MedicalRecords: React.FC = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'analyzing' | 'extracting' | 'minting'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<RecordType>('PRESCRIPTION');

  // Record Details State
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = () => {
    setIsCameraOpen(true);
  };

  const stopCamera = () => {
    setIsCameraOpen(false);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const initCamera = async () => {
      if (isCameraOpen) {
        try {
          setCameraError(null);
          // Stop any existing stream before starting a new one
          if (videoRef.current && videoRef.current.srcObject) {
            const oldStream = videoRef.current.srcObject as MediaStream;
            oldStream.getTracks().forEach(track => track.stop());
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode }
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setCameraError('Could not access camera. Please allow permissions.');
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'Could not access camera. Please check permissions.',
          });
        }
      }
    };

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob/file
        canvas.toBlob((blob) => {
          if (blob) {
            // Dynamic naming: Type-Capture-Timestamp
            const formattedType = uploadType.charAt(0) + uploadType.slice(1).toLowerCase().replace('_', ' ');
            const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
            const fileName = `${formattedType}-Capture-${timestamp}.jpg`;

            const file = new File([blob], fileName, { type: 'image/jpeg' });
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
            stopCamera();
            toast({
              title: 'Photo Captured',
              description: 'Image successfully captured from camera.',
            });
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Ensure camera is stopped if component unmounts or dialog closes
  useEffect(() => {
    if (!isUploadOpen) {
      setIsCameraOpen(false);
    }
  }, [isUploadOpen]);

  // Watch for dialog close to stop camera


  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.summary.toLowerCase().includes(query) ||
        r.hospitalName?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    setFilteredRecords(filtered);
  }, [records, searchQuery, typeFilter]);

  const loadRecords = async () => {
    try {
      const data = await recordsApi.getAll();
      setRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load records',
        description: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    }
  };

  const clearFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    // Simulate the multi-step upload process
    setUploadStep('analyzing');
    await new Promise(r => setTimeout(r, 1500));

    setUploadStep('extracting');
    await new Promise(r => setTimeout(r, 1500));

    setUploadStep('minting');
    await new Promise(r => setTimeout(r, 2000));

    try {
      const result = await recordsApi.upload(selectedFile, uploadType);

      toast({
        title: 'Record Saved & Verified!',
        description: 'Your medical record has been securely stored on the blockchain.',
      });

      setIsUploadOpen(false);
      setIsUploadOpen(false);
      clearFile();
      setUploadStep('idle');
      loadRecords();
      setUploadStep('idle');
      loadRecords();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setEditTitle(record.title);
    setEditSummary(record.summary);
    setIsEditing(false);
    setIsDetailsOpen(true);
  };

  const handleSaveRecord = async () => {
    if (!selectedRecord) return;

    try {
      const updated = await recordsApi.update(selectedRecord.id, {
        title: editTitle,
        summary: editSummary,
      });

      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelectedRecord(updated);
      setIsEditing(false);

      toast({
        title: 'Record Updated',
        description: 'Medical record details saved successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update record details.',
      });
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;

    // Simple confirmation
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      await recordsApi.delete(selectedRecord.id);

      setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
      setIsDetailsOpen(false);
      setSelectedRecord(null);

      toast({
        title: 'Record Deleted',
        description: 'Medical record has been permanently deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Failed to delete record.',
      });
    }
  };

  const getUploadStepMessage = () => {
    switch (uploadStep) {
      case 'analyzing': return 'Analyzing Image...';
      case 'extracting': return 'Extracting Data with AI...';
      case 'minting': return 'Minting to Blockchain...';
      default: return '';
    }
  };

  if (isLoading) {
    return <InlineLoader text="Loading records..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Medical Records
          </h1>
          <p className="mt-1 text-muted-foreground">
            All your health records secured on the blockchain
          </p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Medical Record</DialogTitle>
              <DialogDescription>
                Upload a prescription, lab result, or vaccination record
              </DialogDescription>
            </DialogHeader>

            {!isUploading ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Record Type</Label>
                  <Select value={uploadType} onValueChange={(v) => setUploadType(v as RecordType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                      <SelectItem value="LAB_RESULT">Lab Result</SelectItem>
                      <SelectItem value="VACCINE">Vaccine Record</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document</Label>
                  <div className="grid gap-3">
                    {!isCameraOpen ? (
                      <>
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          {selectedFile && filePreview ? (
                            <div className="relative w-full h-[200px] bg-muted/30 rounded-lg overflow-hidden flex flex-col items-center justify-center border transition-all">
                              {selectedFile.type.startsWith('image/') ? (
                                <img
                                  src={filePreview}
                                  alt="Preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                  <iframe
                                    src={`${filePreview}#toolbar=0&navpanes=0`}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                  />
                                </div>
                              )}

                              <div className="absolute top-2 right-2 flex gap-2 z-10">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8 rounded-full shadow-md"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearFile();
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="absolute bottom-0 w-full bg-black/60 p-2 text-white text-xs flex justify-between items-center z-10">
                                <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                                <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload or drag & drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG or PDF
                              </p>
                            </div>
                          )}
                        </label>

                        {!selectedFile && (
                          <Button variant="outline" className="gap-2" onClick={startCamera}>
                            <Camera className="h-4 w-4" />
                            Take Photo
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          {cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center text-sm">
                              {cameraError}
                            </div>
                          )}
                          <div className="absolute top-4 right-4 z-10">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
                              onClick={switchCamera}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={stopCamera}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={capturePhoto}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Capture
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedFile}
                  onClick={handleUpload}
                >
                  Upload & Process
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{getUploadStepMessage()}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please wait while we process your document
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div className={`h-2 w-2 rounded-full ${uploadStep === 'analyzing' || uploadStep === 'extracting' || uploadStep === 'minting' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-2 w-2 rounded-full ${uploadStep === 'extracting' || uploadStep === 'minting' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-2 w-2 rounded-full ${uploadStep === 'minting' ? 'bg-primary' : 'bg-muted'}`} />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="PRESCRIPTION">Prescriptions</SelectItem>
            <SelectItem value="LAB_RESULT">Lab Results</SelectItem>
            <SelectItem value="VACCINE">Vaccines</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Grid */}
      {filteredRecords.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="card-hover overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge className={recordTypeColors[record.type]}>
                    {recordTypeLabels[record.type]}
                  </Badge>
                  {record.verified && (
                    <StatusBadge status="success" text="Verified" />
                  )}
                </div>
                <CardTitle className="text-lg mt-2 line-clamp-1">
                  {record.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {record.summary}
                </p>

                <div className="space-y-2 text-sm">
                  {record.hospitalName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hospital</span>
                      <span className="font-medium">{record.hospitalName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {format(new Date(record.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <a
                    href={`https://amoy.polygonscan.com/tx/${record.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Chain
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(record)}>
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No records found"
          description={searchQuery || typeFilter !== 'all'
            ? "Try adjusting your search or filters"
            : "Upload your first medical record to get started"
          }
          action={!searchQuery && typeFilter === 'all' ? {
            label: 'Upload Record',
            onClick: () => setIsUploadOpen(true),
          } : undefined}
        />
      )}

      {/* Record Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{isEditing ? 'Edit Record' : 'Record Details'}</span>
              {selectedRecord && !isEditing && (
                <Badge className={recordTypeColors[selectedRecord.type]}>
                  {recordTypeLabels[selectedRecord.type]}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details of your medical record' : 'View full details of your medical record'}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 py-4">
              {/* Preview */}
              <div className="relative w-full h-[200px] bg-muted/30 rounded-lg overflow-hidden border flex items-center justify-center">
                {selectedRecord.fileUrl && selectedRecord.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  // Simplified check for demo purposes, relying on file extension in URL or type
                  <img
                    src={selectedRecord.fileUrl}
                    alt="Record"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Preview';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <FileText className="h-12 w-12 mb-2" />
                    <p>Document Preview</p>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-summary">AI Summary / Notes</Label>
                    <Textarea
                      id="edit-summary"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedRecord.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Uploaded on {format(new Date(selectedRecord.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      AI Analysis Summary
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedRecord.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Hospital</span>
                      <span className="font-medium">{selectedRecord.hospitalName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Verification</span>
                      <span className="font-medium text-success flex items-center gap-1">
                        <Check className="h-3 w-3" /> Verifed on Chain
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveRecord}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="destructive"
                      className="mr-auto"
                      onClick={handleDeleteRecord}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    <DialogClose asChild>
                      <Button>Close</Button>
                    </DialogClose>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
