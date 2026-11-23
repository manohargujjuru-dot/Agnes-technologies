import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import { Services, ServiceDetail } from "./pages/Services.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import { Batches, Contact, Legal, NotFound } from "./pages/Misc.jsx";
import { AdminLayout, AdminLogin, ForgotPassword, RequireAuth, ResetPassword } from "./admin/AdminShell.jsx";
import { BatchesAdmin, CoursesAdmin, Dashboard, EnquiriesAdmin } from "./admin/AdminPages.jsx";
import { CategoriesAdmin, ServicesAdmin, SettingsAdmin, TechnologiesAdmin } from "./admin/ContentPages.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="batches" element={<Batches />} />
        <Route path="contact" element={<Contact />} />
        <Route path="legal" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin/forgot-password" element={<ForgotPassword />} />
      <Route path="admin/reset-password" element={<ResetPassword />} />
      <Route path="admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<CoursesAdmin />} />
        <Route path="batches" element={<BatchesAdmin />} />
        <Route path="enquiries" element={<EnquiriesAdmin />} />
        <Route path="services" element={<ServicesAdmin />} />
        <Route path="technologies" element={<TechnologiesAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>
    </Routes>
  );
}
