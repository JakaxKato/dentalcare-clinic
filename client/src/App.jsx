import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import PatientLayout from './components/layout/PatientLayout';
import DentistLayout from './components/layout/DentistLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import ServiceDetail from './pages/public/ServiceDetail';
import Dentists from './pages/public/Dentists';
import DentistDetail from './pages/public/DentistDetail';
import Appointment from './pages/public/Appointment';
import Blog from './pages/public/Blog';
import ArticleDetail from './pages/public/ArticleDetail';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientProfile from './pages/patient/Profile';

// Dentist
import DentistDashboard from './pages/dentist/Dashboard';
import DentistAppointments from './pages/dentist/Appointments';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminDentists from './pages/admin/Dentists';
import AdminServices from './pages/admin/Services';
import AdminAppointments from './pages/admin/Appointments';
import AdminPatients from './pages/admin/Patients';
import AdminArticles from './pages/admin/Articles';
import AdminTestimonials from './pages/admin/Testimonials';

const App = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="services" element={<Services />} />
      <Route path="services/:slug" element={<ServiceDetail />} />
      <Route path="dentists" element={<Dentists />} />
      <Route path="dentists/:id" element={<DentistDetail />} />
      <Route path="appointment" element={<Appointment />} />
      <Route path="blog" element={<Blog />} />
      <Route path="blog/:slug" element={<ArticleDetail />} />
      <Route path="contact" element={<Contact />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>

    <Route
      path="/patient"
      element={
        <ProtectedRoute roles={['patient']}>
          <PatientLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<PatientDashboard />} />
      <Route path="appointments" element={<PatientAppointments />} />
      <Route path="profile" element={<PatientProfile />} />
    </Route>

    <Route
      path="/dentist"
      element={
        <ProtectedRoute roles={['dentist']}>
          <DentistLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<DentistDashboard />} />
      <Route path="appointments" element={<DentistAppointments />} />
    </Route>

    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="dentists" element={<AdminDentists />} />
      <Route path="services" element={<AdminServices />} />
      <Route path="appointments" element={<AdminAppointments />} />
      <Route path="patients" element={<AdminPatients />} />
      <Route path="articles" element={<AdminArticles />} />
      <Route path="testimonials" element={<AdminTestimonials />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
