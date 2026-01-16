// TypeScript types for Trauma Eye wound analysis

export interface PhotoQuality {
  is_acceptable: boolean;
  quality_score: number;
  issues: string[];
  brightness?: number;
  sharpness?: number;
}

export interface Measurements {
  length_pixels: number;
  width_pixels: number;
  area_pixels: number;
  estimated_cm: string;
  size_category: string;
  bounding_box: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface InfectionAnalysis {
  risk_level: 'HIGH' | 'MODERATE' | 'LOW';
  signs: string[];
  risk_factors: number;
}

export interface TreatmentRecommendations {
  urgency: 'EMERGENCY' | 'URGENT' | 'MONITOR';
  steps: string[];
  seek_emergency_if: string[];
}

export interface WoundComparison {
  healing_status: 'Improving' | 'Stable' | 'Worsening';
  comparison: string;
  area_change_percent: number;
  previous_area_pixels: number;
  current_area_pixels: number;
}

export interface AnalysisResult {
  risk: 'CRITICAL' | 'MODERATE' | 'LOW' | 'NONE' | 'UNKNOWN';
  confidence: number;
  visual_overlay?: string;
  message: string;
  wound_types?: string[];
  infection_analysis?: InfectionAnalysis;
  measurements?: Measurements;
  treatment_recommendations?: TreatmentRecommendations;
  photo_quality: PhotoQuality;
  wound_comparison?: WoundComparison | null;
  timestamp: string;
  error?: boolean;
}

export interface WoundHistoryItem {
  id: string;
  timestamp: string;
  analysisResult: AnalysisResult;
  thumbnail?: string;
}

export interface AnalyzeWoundRequest {
  image: string;
  previous_wound_data?: AnalysisResult;
}
