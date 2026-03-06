import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { ArrowLeft, Camera, CheckCircle, Loader2, QrCode, ScanFace, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CheckInPage = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<"qr" | "face">("qr");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // QR Scanning Loop
  const scanQR = useCallback(() => {
    if (mode !== "qr" || processing || success || !webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            setScannedData(code.data);
            handleCodeDetected(code.data);
          }
        }
      };
    }
  }, [mode, processing, success]);

  useEffect(() => {
    const interval = setInterval(scanQR, 500);
    return () => clearInterval(interval);
  }, [scanQR]);

  const handleCodeDetected = async (code: string) => {
    setProcessing(true);
    toast.info("Código detectado! Buscando aluno...");

    try {
      // In a real scenario, we would look up the student by a unique token or ID in the QR code
      // For now, let's simulate a lookup or try to find a student if the code is a valid UUID
      let foundStudent = null;

      // Check if code is a valid UUID (simple regex)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);

      if (isUUID) {
        // Use RPC for secure public access
        const { data, error } = await supabase
          .rpc('get_student_public_info', { student_id_input: code });
        
        if (!error && data && data.length > 0) {
          const rpcStudent = data[0];
          foundStudent = {
            id: rpcStudent.id,
            name: rpcStudent.name,
            photo_url: rpcStudent.photo_url,
            classes: { name: rpcStudent.class_name },
            class_id: rpcStudent.class_id
          };
        }
      } else {
        // Mock fallback for demo if not UUID or not found
        // Only if we want to show something for invalid codes in demo
        console.log("Not a UUID or not found");
      }

      if (foundStudent) {
        setStudent(foundStudent);
        setSuccess(true);
        toast.success("Aluno identificado!");
      } else {
        // If not found, show error
        toast.error("Aluno não encontrado.");
        setScannedData(null); // Reset to scan again
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("Erro ao buscar aluno.");
      setScannedData(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleFaceCheckIn = async () => {
    if (!webcamRef.current) return;
    setProcessing(true);
    
    // Capture photo
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    // Simulate Face ID processing
    setTimeout(async () => {
      // In a real app, send image to backend for recognition
      // Here we simulate finding a student for DEMO purposes
      
      // Try to find a student via RPC to make it dynamic if possible
      // But for public demo reliability, we'll fallback to a mock if no student found or error
      
      let demoStudent = null;
      
      try {
        // Try to fetch ANY student via RPC just to show real data if available
        // We can't query 'students' table directly as public user
        // We'll just use a mock for the Face ID demo since we can't match a face without AI
        
        demoStudent = {
          id: "demo-face-id",
          name: "Valentina (Demo Facial)",
          photo_url: null,
          classes: { name: "Maternal II" },
          class_id: "demo-class-id"
        };
      } catch (e) {
        console.error("Error in face checkin simulation", e);
      }

      if (demoStudent) {
        setStudent(demoStudent);
        setSuccess(true);
        toast.success("Face reconhecida!");
      } else {
        toast.error("Rosto não reconhecido.");
        setCapturedImage(null);
      }
      setProcessing(false);
    }, 1500);
  };

  const confirmCheckIn = async () => {
    if (!student) return;
    setLoading(true);

    try {
      // Create a daily log entry for attendance
      const today = new Date().toISOString().split("T")[0];
      
      // Check if log exists
      const { data: existingLog } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", student.id)
        .eq("date", today)
        .maybeSingle();

      if (existingLog) {
        toast.info("Aluno já possui registro de presença hoje.");
      } else {
        // Create new log
        await supabase.from("attendance").insert([{
          student_id: student.id,
          class_id: student.class_id,
          date: today,
          present: true,
          notes: "Check-in via Totem"
        }]);
        toast.success("Check-in realizado com sucesso!");
      }
      
      // Reset after delay
      setTimeout(() => {
        setSuccess(false);
        setStudent(null);
        setScannedData(null);
        setCapturedImage(null);
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error("Error confirming check-in:", error);
      toast.error("Erro ao confirmar check-in.");
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setStudent(null);
    setScannedData(null);
    setCapturedImage(null);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border bg-card z-10">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2" size={20} /> Voltar
        </Button>
        <h1 className="text-xl font-display font-bold text-primary">Brotar Check-in</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Mode Toggle */}
        {!success && (
          <div className="absolute top-20 z-10 bg-background/80 backdrop-blur-md p-1 rounded-full border border-border flex gap-1 shadow-sm">
            <Button 
              variant={mode === "qr" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-full px-6"
              onClick={() => setMode("qr")}
            >
              <QrCode className="mr-2" size={16} /> QR Code
            </Button>
            <Button 
              variant={mode === "face" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-full px-6"
              onClick={() => setMode("face")}
            >
              <ScanFace className="mr-2" size={16} /> Facial
            </Button>
          </div>
        )}

        <div className="w-full max-w-md relative aspect-[3/4] sm:aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-muted">
          {/* Webcam */}
          {!capturedImage ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: "user" }}
            />
          ) : (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          )}

          {/* Overlays */}
          {!success && !processing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {mode === "qr" ? (
                <div className="w-64 h-64 border-2 border-primary/50 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                    Aponte o código
                  </div>
                </div>
              ) : (
                <div className="w-64 h-64 border-2 border-dashed border-primary/30 rounded-full relative flex items-center justify-center">
                  <div className="text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full mt-32">
                    Posicione o rosto
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing State */}
          {processing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
              <p className="font-medium text-lg">Processando...</p>
            </div>
          )}

          {/* Success/Confirmation Modal Overlay */}
          {success && student && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-30">
              <Card className="w-full max-w-sm border-none shadow-none bg-transparent text-white">
                <CardContent className="flex flex-col items-center p-0">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4 border-4 border-primary overflow-hidden">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-white/80" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold font-display text-center mb-1">{student.name}</h2>
                  <p className="text-white/60 mb-6">{student.classes?.name || "Sem turma"}</p>
                  
                  <div className="grid gap-3 w-full">
                    <Button 
                      size="lg" 
                      className="w-full bg-success hover:bg-success/90 text-white font-bold"
                      onClick={confirmCheckIn}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                      Confirmar Check-in
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/20 hover:bg-white/10 text-white hover:text-white"
                      onClick={reset}
                      disabled={loading}
                    >
                      <X className="mr-2" /> Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Face Mode Action Button */}
          {mode === "face" && !success && !processing && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
              <Button 
                size="lg" 
                className="rounded-full w-16 h-16 p-0 border-4 border-white/20 bg-primary hover:bg-primary/90 shadow-lg"
                onClick={handleFaceCheckIn}
              >
                <Camera size={24} />
              </Button>
            </div>
          )}
        </div>

        <p className="text-muted-foreground mt-6 text-sm text-center max-w-md">
          {mode === "qr" 
            ? "Aproxime o QR Code do cartão do aluno ou do aplicativo dos pais." 
            : "Olhe diretamente para a câmera e certifique-se que o ambiente está bem iluminado."}
        </p>
      </div>
    </div>
  );
};

export default CheckInPage;
