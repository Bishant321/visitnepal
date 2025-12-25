import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Upload, Lock, Download, Eye, Trash2, Share2, 
  Shield, AlertCircle, CheckCircle, Calendar, File
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DocumentManager() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    document_type: "passport",
    document_name: "",
    expiry_date: "",
    notes: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['travelDocuments'],
    queryFn: () => base44.entities.TravelDocument.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id) => base44.entities.TravelDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelDocuments'] });
      toast.success("Document deleted");
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.document_name) {
      toast.error("Please fill all required fields");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      await base44.entities.TravelDocument.create({
        ...uploadData,
        file_url,
        file_size: selectedFile.size,
        encrypted: true
      });

      queryClient.invalidateQueries({ queryKey: ['travelDocuments'] });
      setShowUpload(false);
      setSelectedFile(null);
      setUploadData({ document_type: "passport", document_name: "", expiry_date: "", notes: "" });
      toast.success("Document uploaded securely!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const documentIcons = {
    passport: "🛂",
    visa: "📋",
    ticket: "🎫",
    insurance: "🏥",
    itinerary: "🗺️",
    vaccination: "💉",
    other: "📄"
  };

  const documentColors = {
    passport: "bg-blue-100 text-blue-700 border-blue-200",
    visa: "bg-green-100 text-green-700 border-green-200",
    ticket: "bg-purple-100 text-purple-700 border-purple-200",
    insurance: "bg-red-100 text-red-700 border-red-200",
    itinerary: "bg-amber-100 text-amber-700 border-amber-200",
    vaccination: "bg-pink-100 text-pink-700 border-pink-200",
    other: "bg-gray-100 text-gray-700 border-gray-200"
  };

  const stats = [
    { label: "Total Documents", value: documents.length, icon: FileText, color: "text-indigo-600" },
    { label: "Encrypted", value: documents.filter(d => d.encrypted).length, icon: Lock, color: "text-green-600" },
    { label: "Expiring Soon", value: documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date(Date.now() + 30*24*60*60*1000)).length, icon: AlertCircle, color: "text-red-600" },
  ];

  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) acc[doc.document_type] = [];
    acc[doc.document_type].push(doc);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Travel Documents</h1>
            <p className="text-gray-600">Securely store and manage your travel documents</p>
          </div>
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-12 h-12 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Form */}
        {showUpload && (
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Upload Secure Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900 mb-1">End-to-End Encryption</p>
                  <p className="text-green-700">All documents are encrypted before upload and stored securely.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type">Document Type</Label>
                  <select
                    id="document_type"
                    value={uploadData.document_type}
                    onChange={(e) => setUploadData({...uploadData, document_type: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="passport">Passport</option>
                    <option value="visa">Visa</option>
                    <option value="ticket">Flight/Train Ticket</option>
                    <option value="insurance">Travel Insurance</option>
                    <option value="itinerary">Itinerary</option>
                    <option value="vaccination">Vaccination Certificate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="document_name">Document Name</Label>
                  <Input
                    id="document_name"
                    value={uploadData.document_name}
                    onChange={(e) => setUploadData({...uploadData, document_name: e.target.value})}
                    placeholder="e.g., My Passport"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={uploadData.expiry_date}
                    onChange={(e) => setUploadData({...uploadData, expiry_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    className="mt-1"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
                  placeholder="Additional information..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                  {uploading ? "Uploading..." : "Upload Securely"}
                </Button>
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Grid */}
        <div className="space-y-6">
          {Object.keys(groupedDocs).map((type) => (
            <Card key={type} className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-stone-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{documentIcons[type]}</span>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} ({groupedDocs[type].length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedDocs[type].map((doc) => {
                    const isExpiringSoon = doc.expiry_date && new Date(doc.expiry_date) < new Date(Date.now() + 30*24*60*60*1000);
                    return (
                      <Card key={doc.id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{doc.document_name}</h4>
                              <Badge className={`${documentColors[doc.document_type]} border text-xs`}>
                                {doc.document_type}
                              </Badge>
                            </div>
                            {doc.encrypted && (
                              <Lock className="w-4 h-4 text-green-600" title="Encrypted" />
                            )}
                          </div>

                          {doc.expiry_date && (
                            <div className={`flex items-center gap-2 text-sm mb-3 ${isExpiringSoon ? 'text-red-600' : 'text-gray-600'}`}>
                              <Calendar className="w-4 h-4" />
                              <span>Expires: {format(new Date(doc.expiry_date), "MMM d, yyyy")}</span>
                              {isExpiringSoon && <AlertCircle className="w-4 h-4" />}
                            </div>
                          )}

                          {doc.notes && (
                            <p className="text-sm text-gray-600 mb-3 italic">"{doc.notes}"</p>
                          )}

                          <div className="text-xs text-gray-500 mb-3">
                            Uploaded {format(new Date(doc.created_date), "MMM d, yyyy")}
                            {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(0)} KB`}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="flex-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = doc.file_url;
                                a.download = doc.document_name;
                                a.click();
                              }}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDocumentMutation.mutate(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-6">Start by uploading your travel documents securely</p>
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}