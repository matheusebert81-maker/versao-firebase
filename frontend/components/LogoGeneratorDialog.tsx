import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader2, Wand2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

export default function LogoGeneratorDialog() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("Um logo moderno e minimalista para uma clínica veterinária, com um cachorro e um gato, cores azul e verde, estilo flat design");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          setImageUrl(`data:${mimeType};base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setError("Não foi possível gerar a imagem. Tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro ao gerar logo:", err);
      setError(err.message || "Erro ao gerar a imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:text-accent-foreground h-8 px-3 rounded-full border-purple-100 text-purple-600 hover:bg-purple-50">
          <Wand2 className="w-4 h-4 mr-1" /> Gerar Logo
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Gerador de Logo com IA
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Descreva como você quer o logo da clínica</Label>
            <Input 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Logo minimalista com um cachorro..."
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Gerar Logo
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}

          {imageUrl && (
            <div className="mt-4 space-y-2">
              <Label>Resultado:</Label>
              <div className="border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                <img src={imageUrl} alt="Logo gerado" className="max-w-full max-h-[300px] object-contain rounded-md shadow-sm" />
              </div>
              <div className="flex justify-end">
                <a 
                  href={imageUrl} 
                  download="logo-clinica.png"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Baixar Imagem
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
