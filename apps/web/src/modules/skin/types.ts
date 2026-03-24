export interface SkinAnalyzePayload {
  imageBase64: string;
}

export interface SkinAnalyzeResult {
  diagnosis: string;
  probability: number;
  typicalImage: string;
}
