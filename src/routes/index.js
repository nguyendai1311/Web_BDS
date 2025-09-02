import SignInPage from "../pages/User/SignInPages/SignInPages";
import ProfilePage from "../pages/User/ProfilePages/ProfilePages";
import AdminLayout from "../pages/Admin/AdminLayout/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard/AdminDashboard";
import ReportPage from "../pages/Admin/ReportPage/ReportPage";
import AssessPage from "../pages/Admin/AssessPage/AssessPage";
import AccessDeniedPage from "../pages/User/AccessDeniedPage/AccessDeniedPage";
import EmployeePage from "../pages/Admin/EmployeePage/EmployeePage";
import CitizenPage from "../pages/Admin/CitizenPage/CitizenPage";
import HouseHoldSelectPage from "../pages/Admin/HouseHoldSelectPage/HouseHoldSelectPage";
import ProjectPage from "../pages/Admin/ProjectPage/ProjectPage";
import EmployeeSelectPage from "../pages/Admin/EmployeeSelectPage/EmployeeSelectPage";
import LandPricePage from "../pages/Admin/LandPricePage/LandPricePage";
import LandPriceDetailPage from "../pages/Admin/LandPriceSelectPage/LandPriceSelectPage";

export const routes = [
  {
    path: "/sign-in",
    page: SignInPage,
    isShowHeader: false,
    isShowFooter: false,
  },
  {
    path: "/profile-user",
    page: ProfilePage,
    isShowHeader: true,
    isShowFooter: false,
  },
  {
    path: "/system/admin",
    isPrivated: true,
    layout: AdminLayout,
    allowedRoles: ["admin"],
    children: [
      { path: "", page: AdminDashboard },
      { path: "employees", page: EmployeePage },
      { path: "citizens", page: CitizenPage },
      { path: "assess", page: AssessPage },
      { path: "report", page: ReportPage },
      { path: "project", page: ProjectPage },
      { path: "employees/:id/:mode", page: EmployeeSelectPage },   
      { path: "households/:id/:mode", page: HouseHoldSelectPage },
      { path: "lands/:id/:mode", page: LandPriceDetailPage },
      { path: "lands", page: LandPricePage },
    ],
  },
  {
    path: "/access-denied",
    page: AccessDeniedPage,
  },
  {
    path: "*",
    page: AccessDeniedPage,
  },
];
