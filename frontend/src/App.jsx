import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentAssessment from './pages/student/Assessment';
import StudentSkillGap from './pages/student/SkillGap';
import StudentOpportunities from './pages/student/Opportunities';
import StudentOpportunityDetail from './pages/student/OpportunityDetail';
import StudentApplications from './pages/student/Applications';
import StudentLearning from './pages/student/Learning';
import StudentPortfolio from './pages/student/Portfolio';
import StudentAssistant from './pages/student/Assistant';

import IndustryDashboard from './pages/industry/Dashboard';
import IndustryCompanyProfile from './pages/industry/CompanyProfile';
import IndustryOpportunities from './pages/industry/Opportunities';
import IndustryApplicants from './pages/industry/Applicants';
import IndustryCandidates from './pages/industry/Candidates';
import IndustryFacultyPrograms from './pages/industry/FacultyPrograms';

import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyProfile from './pages/faculty/Profile';
import FacultyOpportunities from './pages/faculty/Opportunities';
import FacultyApplications from './pages/faculty/Applications';

import InstitutionDashboard from './pages/institution/Dashboard';
import InstitutionStudents from './pages/institution/Students';
import InstitutionAnalytics from './pages/institution/Analytics';
import InstitutionProfile from './pages/institution/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={['student']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="assessment" element={<StudentAssessment />} />
        <Route path="skill-gap" element={<StudentSkillGap />} />
        <Route path="opportunities" element={<StudentOpportunities />} />
        <Route path="opportunities/:type/:id" element={<StudentOpportunityDetail />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="learning" element={<StudentLearning />} />
        <Route path="portfolio" element={<StudentPortfolio />} />
        <Route path="assistant" element={<StudentAssistant />} />
      </Route>

      <Route
        path="/industry"
        element={
          <ProtectedRoute roles={['industry']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IndustryDashboard />} />
        <Route path="company" element={<IndustryCompanyProfile />} />
        <Route path="opportunities" element={<IndustryOpportunities />} />
        <Route path="applicants" element={<IndustryApplicants />} />
        <Route path="candidates" element={<IndustryCandidates />} />
        <Route path="faculty-programs" element={<IndustryFacultyPrograms />} />
      </Route>

      <Route
        path="/faculty"
        element={
          <ProtectedRoute roles={['faculty']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="profile" element={<FacultyProfile />} />
        <Route path="opportunities" element={<FacultyOpportunities />} />
        <Route path="applications" element={<FacultyApplications />} />
      </Route>

      <Route
        path="/institution"
        element={
          <ProtectedRoute roles={['institution']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstitutionDashboard />} />
        <Route path="students" element={<InstitutionStudents />} />
        <Route path="analytics" element={<InstitutionAnalytics />} />
        <Route path="profile" element={<InstitutionProfile />} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;
