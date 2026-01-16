import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Emergency from './pages/Emergency'
import HealthCheck from './pages/HealthCheck'
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

// Health check feature pages
import PillIdentifier from './health/PillIdentifier'
import WoundWatchHealth from './health/WoundWatch'
import RespiTrack from './health/RespiTrack'
import BurnGuide from './health/BurnGuide'
import DoctorChecklist from './health/DoctorChecklist'
import SymptomSieve from './health/SymptomSieve'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - No Layout */}
        <Route path="/triage/:token" element={<TriageCardView />} />
        
        {/* Main App Routes with Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/health" element={<HealthCheck />} />
          
          {/* Emergency Features */}
          <Route path="/emergency/vital-scan" element={<VitalScan />} />
          <Route path="/emergency/cpr" element={<CPRCoach />} />
          <Route path="/emergency/action-cards" element={<ActionCards />} />
          <Route path="/emergency/aed-finder" element={<AEDFinder />} />
          <Route path="/emergency/trauma-track" element={<TraumaTrack />} />
          <Route path="/emergency/burn-help" element={<BurnHelp />} />
          <Route path="/emergency/contacts" element={<EmergencyContacts />} />
          <Route path="/emergency/chatbot" element={<EmergencyChatbot />} />
          {/* Health Check Features */}
          <Route path="/health/pill-identifier" element={<PillIdentifier />} />
          <Route path="/health/wound-watch" element={<WoundWatchHealth />} />
          <Route path="/health/burn-guide" element={<BurnGuide />} />
          <Route path="/health/respi-track" element={<RespiTrack />} />
              <Route path="/health/doctor-checklist" element={<DoctorChecklist />} />
              <Route path="/health/symptom-sieve" element={<SymptomSieve />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
