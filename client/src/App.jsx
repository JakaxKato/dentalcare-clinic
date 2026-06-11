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
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientProfile from './pages/patient/Profile';
import PatientTestimonials from './pages/patient/Testimonials';
import PatientPrescriptions from './pages/patient/Prescriptions';

// Dentist
import DentistDashboard from './pages/dentist/Dashboard';
import DentistAppointments from './pages/dentist/Appointments';
import DentistTreatment from './pages/dentist/Treatment';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminDentists from './pages/admin/Dentists';
import AdminServices from './pages/admin/Services';
import AdminAppointments from './pages/admin/Appointments';
import AdminPatients from './pages/admin/Patients';
import AdminArticles from './pages/admin/Articles';
import AdminTestimonials from './pages/admin/Testimonials';

// Shared
import InvoiceList from './pages/shared/InvoiceList';

// Print
import PrescriptionPrint from './pages/print/PrescriptionPrint';

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
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />
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

      <Route path="testimonials" element={<PatientTestimonials />} />
=======
      <Route path="prescriptions" element={<PatientPrescriptions />} />
      <Route path="invoices" element={<InvoiceList />} />
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
      <Route path="treatment/:id" element={<DentistTreatment />} />
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
      <Route path="invoices" element={<InvoiceList isAdmin />} />
      <Route path="articles" element={<AdminArticles />} />
      <Route path="testimonials" element={<AdminTestimonials />} />
    </Route>

    <Route
      path="/print/prescription/:id"
      element={
        <ProtectedRoute roles={['patient', 'dentist', 'admin']}>
          <PrescriptionPrint />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
