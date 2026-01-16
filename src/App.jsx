import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Emergency from './pages/Emergency'
import HealthCheck from './pages/HealthCheck'

// Emergency feature pages
import CPRCoach from './emergency/CPRCoach'
import ActionCards from './emergency/ActionCards'
import AEDFinder from './emergency/AEDFinder'
import EmergencyContacts from './emergency/EmergencyContacts'
import VoiceGuidance from './emergency/VoiceGuidance'

// Health check feature pages
import WoundWatch from './health/WoundWatch'
import BurnGuide from './health/BurnGuide'
import DoctorChecklist from './health/DoctorChecklist'
import DoctorPrep from './health/DoctorPrep'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/health" element={<HealthCheck />} />
          
          {/* Emergency Features */}
          <Route path="/emergency/cpr" element={<CPRCoach />} />
          <Route path="/emergency/action-cards" element={<ActionCards />} />
          <Route path="/emergency/aed-finder" element={<AEDFinder />} />
          <Route path="/emergency/contacts" element={<EmergencyContacts />} />
          <Route path="/emergency/voice-guidance" element={<VoiceGuidance />} />
          
          {/* Health Check Features */}
          <Route path="/health/wound-watch" element={<WoundWatch />} />
          <Route path="/health/burn-guide" element={<BurnGuide />} />
          <Route path="/health/doctor-checklist" element={<DoctorChecklist />} />
          <Route path="/health/doctor-prep" element={<DoctorPrep />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
