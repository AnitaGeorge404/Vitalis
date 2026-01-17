import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Emergency from './pages/Emergency'
import HealthCheck from './pages/HealthCheck'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TriageCardView from './emergency/TriageCardView'

// Emergency feature pages
import CPRCoach from './emergency/CPRCoach'
import ActionCards from './emergency/ActionCards'
import AEDFinder from './emergency/AEDFinder'
import TraumaTrack from './emergency/TraumaTrack'
import BurnHelp from './emergency/BurnHelp'
import EmergencyContacts from './emergency/EmergencyContacts'
import EmergencyChatbot from './emergency/EmergencyChatbot'
import VitalScan from './emergency/VitalScan'
import TriageViewer from './emergency/TriageViewer'

// Health check feature pages
import PillIdentifier from './health/PillIdentifier'
import WoundWatchHealth from './health/WoundWatch'
import RespiTrack from './health/RespiTrack'
import BurnGuide from './health/BurnGuide'
import DoctorChecklist from './health/DoctorChecklist'
import SymptomSieve from './health/SymptomSieve'
import SkinRashRiskDetector from './health/SkinRashRisk'
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/triage/:token" element={<TriageCardView />} />
        
        {/* Main App Routes with Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/health" element={<ProtectedRoute><HealthCheck /></ProtectedRoute>} />
          
          {/* Emergency Features - PUBLIC (No Login Required) */}
          <Route path="/emergency/vital-scan" element={<VitalScan />} />
          <Route path="/emergency/cpr" element={<CPRCoach />} />
          <Route path="/emergency/action-cards" element={<ActionCards />} />
          <Route path="/emergency/aed-finder" element={<AEDFinder />} />
          <Route path="/emergency/trauma-track" element={<TraumaTrack />} />
          <Route path="/emergency/burn-help" element={<BurnHelp />} />
          <Route path="/emergency/contacts" element={<EmergencyContacts />} />
          <Route path="/emergency/chatbot" element={<EmergencyChatbot />} />
          <Route path="/emergency/triage/:linkId" element={<TriageViewer />} />
          
          {/* Health Check Features - PROTECTED (Login Required) */}
          <Route path="/health/pill-identifier" element={<ProtectedRoute><PillIdentifier /></ProtectedRoute>} />
          <Route path="/health/wound-watch" element={<ProtectedRoute><WoundWatchHealth /></ProtectedRoute>} />
          <Route path="/health/burn-guide" element={<ProtectedRoute><BurnGuide /></ProtectedRoute>} />
          <Route path="/health/respi-track" element={<ProtectedRoute><RespiTrack /></ProtectedRoute>} />
              <Route path="/health/doctor-checklist" element={<ProtectedRoute><DoctorChecklist /></ProtectedRoute>} />
              <Route path="/health/symptom-sieve" element={<ProtectedRoute><SymptomSieve /></ProtectedRoute>} />
              <Route path="/health/skin-rash-risk" element={<ProtectedRoute><SkinRashRiskDetector /></ProtectedRoute>} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
