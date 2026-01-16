#!/usr/bin/env python3
"""
Trauma Eye - Emergency Wound Analysis System
Uses OpenCV and NumPy for computer vision-based wound detection and classification
"""

import sys
import json
import base64
import cv2
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple, Any


class WoundAnalyzer:
    """Main class for analyzing wound images"""
    
    def __init__(self):
        self.min_resolution = (400, 400)
        self.min_brightness = 40
        self.max_brightness = 240
        self.blur_threshold = 100.0
        self.pixel_to_cm = 100  # Rough estimate: 100 pixels ≈ 1cm
    
    def analyze(self, image_data: str, previous_wound_data: Dict = None) -> Dict[str, Any]:
        """
        Main analysis pipeline
        Args:
            image_data: Base64 encoded image string
            previous_wound_data: Previous wound analysis for comparison
        Returns:
            Complete analysis results dictionary
        """
        try:
            # Decode image
            img = self._decode_image(image_data)
            if img is None:
                return self._error_response("Failed to decode image")
            
            # Check photo quality
            quality_result = self._check_photo_quality(img)
            if not quality_result['is_acceptable']:
                return {
                    'risk': 'UNKNOWN',
                    'confidence': 0.0,
                    'message': 'Photo quality is insufficient for analysis. Please retake the photo.',
                    'photo_quality': quality_result,
                    'timestamp': datetime.now().isoformat()
                }
            
            # Detect wounds
            wound_mask, contours = self._detect_wounds(img)
            
            if len(contours) == 0:
                return {
                    'risk': 'NONE',
                    'confidence': 0.0,
                    'message': 'No wound detected in the image. Please ensure the wound is clearly visible.',
                    'photo_quality': quality_result,
                    'timestamp': datetime.now().isoformat()
                }
            
            # Get largest wound contour
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Measure wound
            measurements = self._measure_wound(largest_contour)
            
            # Classify wound type
            wound_types = self._classify_wound(img, wound_mask, largest_contour)
            
            # Check for infection
            infection_analysis = self._detect_infection(img, wound_mask)
            
            # Generate annotated image
            annotated_img = self._draw_annotations(img.copy(), contours)
            annotated_base64 = self._encode_image(annotated_img)
            
            # Determine risk level
            risk_level, confidence = self._calculate_risk(
                measurements, wound_types, infection_analysis
            )
            
            # Generate treatment recommendations
            treatment = self._generate_treatment(
                risk_level, wound_types, infection_analysis, measurements
            )
            
            # Compare with previous wound if available
            comparison = None
            if previous_wound_data:
                comparison = self._compare_wounds(measurements, previous_wound_data)
            
            return {
                'risk': risk_level,
                'confidence': confidence,
                'visual_overlay': annotated_base64,
                'message': self._generate_message(risk_level, wound_types),
                'wound_types': wound_types,
                'infection_analysis': infection_analysis,
                'measurements': measurements,
                'treatment_recommendations': treatment,
                'photo_quality': quality_result,
                'wound_comparison': comparison,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return self._error_response(f"Analysis error: {str(e)}")
    
    def _decode_image(self, image_data: str) -> np.ndarray:
        """Decode base64 image to OpenCV format"""
        try:
            # Remove data URL prefix if present
            if 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]
            
            # Decode base64
            img_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception:
            return None
    
    def _encode_image(self, img: np.ndarray) -> str:
        """Encode OpenCV image to base64"""
        _, buffer = cv2.imencode('.jpg', img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{img_base64}"
    
    def _check_photo_quality(self, img: np.ndarray) -> Dict[str, Any]:
        """Check if photo quality is acceptable for analysis"""
        issues = []
        quality_score = 100
        
        # Check resolution
        height, width = img.shape[:2]
        if height < self.min_resolution[0] or width < self.min_resolution[1]:
            issues.append(f"Resolution too low ({width}x{height}). Minimum: {self.min_resolution[0]}x{self.min_resolution[1]}")
            quality_score -= 40
        
        # Check brightness
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        avg_brightness = np.mean(gray)
        
        if avg_brightness < self.min_brightness:
            issues.append("Image too dark. Use better lighting.")
            quality_score -= 30
        elif avg_brightness > self.max_brightness:
            issues.append("Image too bright. Reduce lighting or avoid flash.")
            quality_score -= 20
        
        # Check blur (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < self.blur_threshold:
            issues.append("Image is blurry. Hold camera steady and focus on wound.")
            quality_score -= 30
        
        is_acceptable = quality_score >= 40
        
        return {
            'is_acceptable': is_acceptable,
            'quality_score': max(0, quality_score),
            'issues': issues if not is_acceptable else [],
            'brightness': float(avg_brightness),
            'sharpness': float(laplacian_var)
        }
    
    def _detect_wounds(self, img: np.ndarray) -> Tuple[np.ndarray, List]:
        """Detect wounds using HSV color space red detection"""
        # Convert to HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define red color ranges (two ranges for red in HSV)
        lower_red1 = np.array([0, 50, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 50, 50])
        upper_red2 = np.array([180, 255, 255])
        
        # Create masks
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        wound_mask = cv2.bitwise_or(mask1, mask2)
        
        # Morphological operations to clean up mask
        kernel = np.ones((5, 5), np.uint8)
        wound_mask = cv2.morphologyEx(wound_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        wound_mask = cv2.morphologyEx(wound_mask, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Find contours
        contours, _ = cv2.findContours(wound_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter small contours (noise)
        min_area = 500
        contours = [c for c in contours if cv2.contourArea(c) > min_area]
        
        return wound_mask, contours
    
    def _measure_wound(self, contour: np.ndarray) -> Dict[str, Any]:
        """Measure wound dimensions"""
        # Bounding box
        x, y, w, h = cv2.boundingRect(contour)
        
        # Contour area
        area_pixels = cv2.contourArea(contour)
        
        # Estimate size in cm
        estimated_cm = (w + h) / (2 * self.pixel_to_cm)
        
        # Categorize size
        if estimated_cm < 1:
            size_category = "Small (<1cm)"
        elif estimated_cm < 3:
            size_category = "Medium (1-3cm)"
        elif estimated_cm < 10:
            size_category = "Large (3-10cm)"
        else:
            size_category = "Very Large (>10cm)"
        
        return {
            'length_pixels': int(h),
            'width_pixels': int(w),
            'area_pixels': int(area_pixels),
            'estimated_cm': f"~{estimated_cm:.1f}cm",
            'size_category': size_category,
            'bounding_box': {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}
        }
    
    def _classify_wound(self, img: np.ndarray, wound_mask: np.ndarray, 
                       contour: np.ndarray) -> List[str]:
        """Classify wound type"""
        wound_types = []
        
        # Get wound region
        x, y, w, h = cv2.boundingRect(contour)
        wound_region = img[y:y+h, x:x+w]
        wound_region_mask = wound_mask[y:y+h, x:x+w]
        
        if wound_region.size == 0:
            return ["Unknown wound type"]
        
        # Convert to grayscale and HSV
        gray_wound = cv2.cvtColor(wound_region, cv2.COLOR_BGR2GRAY)
        hsv_wound = cv2.cvtColor(wound_region, cv2.COLOR_BGR2HSV)
        
        # Burn detection (look for charring/white areas)
        charred = np.sum(gray_wound < 50) / gray_wound.size
        white_tissue = np.sum(gray_wound > 200) / gray_wound.size
        
        if charred > 0.15 or white_tissue > 0.2:
            if charred > 0.3:
                wound_types.append("3rd Degree Burn (charred tissue - EMERGENCY)")
            elif white_tissue > 0.3:
                wound_types.append("2nd Degree Burn (blisters/white tissue)")
            else:
                wound_types.append("1st Degree Burn (redness)")
        
        # Laceration vs abrasion (edge analysis)
        perimeter = cv2.arcLength(contour, True)
        area = cv2.contourArea(contour)
        if area > 0:
            circularity = 4 * np.pi * area / (perimeter ** 2)
            
            if circularity < 0.3:
                wound_types.append("Laceration (cut with jagged edges)")
            elif circularity < 0.6:
                wound_types.append("Abrasion (scrape)")
        
        # Puncture detection (small circular wound)
        if area < 2000 and circularity > 0.7:
            wound_types.append("Puncture wound (deep)")
        
        # If no specific type detected
        if not wound_types:
            wound_types.append("Open wound (general)")
        
        return wound_types
    
    def _detect_infection(self, img: np.ndarray, wound_mask: np.ndarray) -> Dict[str, Any]:
        """Detect signs of infection"""
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        signs = []
        risk_factors = 0
        
        # Detect yellow/green discharge (pus)
        lower_yellow = np.array([20, 50, 50])
        upper_yellow = np.array([40, 255, 255])
        lower_green = np.array([40, 50, 50])
        upper_green = np.array([80, 255, 255])
        
        yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        discharge_mask = cv2.bitwise_or(yellow_mask, green_mask)
        
        # Check for discharge in wound area
        discharge_in_wound = cv2.bitwise_and(discharge_mask, wound_mask)
        discharge_ratio = np.sum(discharge_in_wound > 0) / max(np.sum(wound_mask > 0), 1)
        
        if discharge_ratio > 0.05:
            signs.append("Yellow/green discharge detected (possible pus)")
            risk_factors += 2
        
        # Detect necrotic tissue (dark/black areas)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        necrotic_mask = cv2.inRange(gray, 0, 40)
        necrotic_in_wound = cv2.bitwise_and(necrotic_mask, wound_mask)
        necrotic_ratio = np.sum(necrotic_in_wound > 0) / max(np.sum(wound_mask > 0), 1)
        
        if necrotic_ratio > 0.1:
            signs.append("Dark/necrotic tissue detected")
            risk_factors += 2
        
        # Check for excessive inflammation (very intense red around wound)
        kernel = np.ones((15, 15), np.uint8)
        dilated_wound = cv2.dilate(wound_mask, kernel, iterations=3)
        inflammation_area = cv2.subtract(dilated_wound, wound_mask)
        
        lower_intense_red = np.array([0, 100, 100])
        upper_intense_red = np.array([10, 255, 255])
        intense_red_mask = cv2.inRange(hsv, lower_intense_red, upper_intense_red)
        inflammation_red = cv2.bitwise_and(intense_red_mask, inflammation_area)
        inflammation_ratio = np.sum(inflammation_red > 0) / max(np.sum(inflammation_area > 0), 1)
        
        if inflammation_ratio > 0.3:
            signs.append("Excessive inflammation around wound")
            risk_factors += 1
        
        # Determine risk level
        if risk_factors >= 3:
            risk_level = "HIGH"
        elif risk_factors >= 1:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"
            signs.append("No obvious signs of infection")
        
        return {
            'risk_level': risk_level,
            'signs': signs,
            'risk_factors': risk_factors
        }
    
    def _draw_annotations(self, img: np.ndarray, contours: List) -> np.ndarray:
        """Draw bounding boxes and annotations on image"""
        for contour in contours:
            # Draw contour
            cv2.drawContours(img, [contour], -1, (0, 255, 0), 3)
            
            # Draw bounding box
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
            
            # Add label
            cv2.putText(img, "WOUND", (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
        
        return img
    
    def _calculate_risk(self, measurements: Dict, wound_types: List[str], 
                       infection_analysis: Dict) -> Tuple[str, float]:
        """Calculate overall risk level and confidence"""
        risk_score = 0
        
        # Size-based risk
        area = measurements['area_pixels']
        if area > 50000:  # Very large wound
            risk_score += 3
        elif area > 20000:  # Large wound
            risk_score += 2
        elif area > 5000:  # Medium wound
            risk_score += 1
        
        # Wound type risk
        for wound_type in wound_types:
            if "3rd Degree" in wound_type or "EMERGENCY" in wound_type:
                risk_score += 4
            elif "Puncture" in wound_type or "2nd Degree" in wound_type:
                risk_score += 2
            elif "Laceration" in wound_type:
                risk_score += 1
        
        # Infection risk
        infection_risk = infection_analysis['risk_level']
        if infection_risk == "HIGH":
            risk_score += 3
        elif infection_risk == "MODERATE":
            risk_score += 2
        elif infection_risk == "LOW":
            risk_score += 0
        
        # Determine risk level
        if risk_score >= 6:
            risk_level = "CRITICAL"
            confidence = 0.85
        elif risk_score >= 3:
            risk_level = "MODERATE"
            confidence = 0.75
        else:
            risk_level = "LOW"
            confidence = 0.70
        
        return risk_level, confidence
    
    def _generate_treatment(self, risk_level: str, wound_types: List[str], 
                           infection_analysis: Dict, measurements: Dict) -> Dict[str, Any]:
        """Generate treatment recommendations"""
        steps = []
        urgency = "MONITOR"
        
        # Determine urgency
        if risk_level == "CRITICAL":
            urgency = "EMERGENCY"
            steps.append("🚨 CALL EMERGENCY SERVICES (911) IMMEDIATELY")
            steps.append("Do NOT attempt home treatment - professional care required")
        elif risk_level == "MODERATE":
            urgency = "URGENT"
            steps.append("Seek medical attention within 2-4 hours")
        
        # Burn-specific treatment
        if any("Burn" in wt for wt in wound_types):
            if "3rd Degree" in str(wound_types):
                steps.append("Cover burn loosely with sterile gauze - DO NOT remove clothing stuck to burn")
                steps.append("Elevate burned area above heart if possible")
            else:
                steps.append("Cool burn under running water for 10-20 minutes")
                steps.append("Cover with sterile, non-stick dressing")
                steps.append("DO NOT apply ice, butter, or ointments to burns")
        else:
            # General wound care
            steps.append("Stop any bleeding by applying direct pressure with clean cloth")
            steps.append("Clean wound gently with clean water or saline solution")
            steps.append("Remove any visible debris with clean tweezers")
            steps.append("Apply antibiotic ointment (like Neosporin) if not allergic")
            steps.append("Cover with sterile bandage or gauze")
            steps.append("Change dressing daily or when wet/dirty")
        
        # Infection treatment
        if infection_analysis['risk_level'] in ["HIGH", "MODERATE"]:
            steps.append("⚠️ Signs of infection present - see doctor for antibiotics")
            steps.append("Watch for fever, increased pain, or spreading redness")
        
        # Size-specific advice
        if measurements['area_pixels'] > 20000:
            steps.append("Wound may require stitches or surgical closure")
        
        # Puncture wound specific
        if any("Puncture" in wt for wt in wound_types):
            steps.append("⚠️ Tetanus shot may be needed if not up to date")
            steps.append("Puncture wounds have high infection risk - monitor closely")
        
        # General advice
        steps.append("Take over-the-counter pain reliever (ibuprofen or acetaminophen)")
        steps.append("Elevate injured area to reduce swelling")
        steps.append("Avoid picking at scabs or removing bandages prematurely")
        
        # When to seek emergency care
        warning_signs = [
            "Bleeding doesn't stop after 10 minutes of pressure",
            "Wound edges gap open or won't stay closed",
            "Signs of infection worsen (fever, red streaks, increased pus)",
            "Numbness or loss of function in affected area",
            "Object embedded in wound"
        ]
        
        return {
            'urgency': urgency,
            'steps': steps,
            'seek_emergency_if': warning_signs
        }
    
    def _compare_wounds(self, current_measurements: Dict, 
                       previous_wound_data: Dict) -> Dict[str, Any]:
        """Compare current wound with previous image"""
        try:
            prev_area = previous_wound_data.get('measurements', {}).get('area_pixels', 0)
            current_area = current_measurements['area_pixels']
            
            if prev_area == 0:
                return None
            
            # Calculate change
            area_change = current_area - prev_area
            area_change_percent = (area_change / prev_area) * 100
            
            # Determine healing status
            if area_change_percent < -10:
                healing_status = "Improving"
                comparison = f"Wound decreased by {abs(area_change_percent):.1f}% - healing well ✓"
            elif area_change_percent > 10:
                healing_status = "Worsening"
                comparison = f"⚠️ Wound increased by {area_change_percent:.1f}% - seek medical attention"
            else:
                healing_status = "Stable"
                comparison = f"Wound size stable (±{abs(area_change_percent):.1f}%)"
            
            return {
                'healing_status': healing_status,
                'comparison': comparison,
                'area_change_percent': round(area_change_percent, 2),
                'previous_area_pixels': prev_area,
                'current_area_pixels': current_area
            }
        except Exception:
            return None
    
    def _generate_message(self, risk_level: str, wound_types: List[str]) -> str:
        """Generate user-facing message"""
        if risk_level == "CRITICAL":
            return "🚨 CRITICAL WOUND DETECTED. Seek emergency medical care immediately!"
        elif risk_level == "MODERATE":
            return f"Wound detected: {', '.join(wound_types)}. Medical attention recommended."
        else:
            return "Minor wound detected. Follow treatment recommendations and monitor for changes."
    
    def _error_response(self, error_msg: str) -> Dict[str, Any]:
        """Generate error response"""
        return {
            'error': True,
            'message': error_msg,
            'timestamp': datetime.now().isoformat()
        }


def main():
    """Main entry point - reads JSON from stdin, outputs JSON to stdout"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Extract image and previous data
        image_data = input_data.get('image', '')
        previous_wound_data = input_data.get('previous_wound_data')
        
        if not image_data:
            result = {'error': True, 'message': 'No image data provided'}
        else:
            # Analyze wound
            analyzer = WoundAnalyzer()
            result = analyzer.analyze(image_data, previous_wound_data)
        
        # Output result as JSON
        print(json.dumps(result))
        sys.exit(0)
        
    except json.JSONDecodeError:
        error_result = {'error': True, 'message': 'Invalid JSON input'}
        print(json.dumps(error_result))
        sys.exit(1)
    except Exception as e:
        error_result = {'error': True, 'message': f'Unexpected error: {str(e)}'}
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == '__main__':
    main()
