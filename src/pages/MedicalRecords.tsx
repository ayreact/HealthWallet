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
  Loader2
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
  const [uploadType, setUploadType] = useState<RecordType>('PRESCRIPTION');

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
    }
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
      setSelectedFile(null);
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
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="text-center p-4">
                          <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag & drop
                          </p>
                        </div>
                      )}
                    </label>
                    
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
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
                    href={`https://polygonscan.com/tx/${record.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View on Chain
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <Button variant="outline" size="sm">
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
    </div>
  );
};
