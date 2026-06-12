import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import PatientLayout from './components/layout/PatientLayout';
import DentistLayout from './components/layout/DentistLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import Loader from './components/common/Loader';

// Public (lazy loaded)
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const ServiceDetail = lazy(() => import('./pages/public/ServiceDetail'));
const Dentists = lazy(() => import('./pages/public/Dentists'));
const DentistDetail = lazy(() => import('./pages/public/DentistDetail'));
const Appointment = lazy(() => import('./pages/public/Appointment'));
const Blog = lazy(() => import('./pages/public/Blog'));
const ArticleDetail = lazy(() => import('./pages/public/ArticleDetail'));
const Contact = lazy(() => import('./pages/public/Contact'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

// Auth (lazy loaded)
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Patient (lazy loaded)
const PatientDashboard = lazy(() => import('./pages/patient/Dashboard'));
const PatientAppointments = lazy(() => import('./pages/patient/Appointments'));
const PatientProfile = lazy(() => import('./pages/patient/Profile'));
const PatientTestimonials = lazy(() => import('./pages/patient/Testimonials'));
const PatientPrescriptions = lazy(() => import('./pages/patient/Prescriptions'));

// Dentist (lazy loaded)
const DentistDashboard = lazy(() => import('./pages/dentist/Dashboard'));
const DentistAppointments = lazy(() => import('./pages/dentist/Appointments'));
const DentistTreatment = lazy(() => import('./pages/dentist/Treatment'));

// Admin (lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminDentists = lazy(() => import('./pages/admin/Dentists'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminAppointments = lazy(() => import('./pages/admin/Appointments'));
const AdminPatients = lazy(() => import('./pages/admin/Patients'));
const AdminArticles = lazy(() => import('./pages/admin/Articles'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Shared (lazy loaded)
const InvoiceList = lazy(() => import('./pages/shared/InvoiceList'));

// Print (lazy loaded)
const PrescriptionPrint = lazy(() => import('./pages/print/PrescriptionPrint'));

const App = () => (
  <Suspense fallback={<Loader />}>
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
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="testimonials" element={<PatientTestimonials />} />
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
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DentistDashboard />} />
        <Route path="appointments" element={<DentistAppointments />} />
        <Route path="treatment/:id" element={<DentistTreatment />} />
        <Route path="invoices" element={<InvoiceList />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="dentists" element={<AdminDentists />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="invoices" element={<InvoiceList isAdmin />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="settings" element={<AdminSettings />} />
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
  </Suspense>
);

export default App;
