import AIPlanner from './pages/AIPlanner';
import Alerts from './pages/Alerts';
import AlertsDashboard from './pages/AlertsDashboard';
import Culture from './pages/Culture';
import CultureDetail from './pages/CultureDetail';
import DestinationDetail from './pages/DestinationDetail';
import Destinations from './pages/Destinations';
import ExperienceDetail from './pages/ExperienceDetail';
import Experiences from './pages/Experiences';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import HostProfile from './pages/HostProfile';
import Maps from './pages/Maps';
import MyBookings from './pages/MyBookings';
import MyPlans from './pages/MyPlans';
import Profile from './pages/Profile';
import Trekking from './pages/Trekking';
import TrekkingDetail from './pages/TrekkingDetail';
import Dashboard from './pages/Dashboard';
import DocumentManager from './pages/DocumentManager';
import IoTMonitor from './pages/IoTMonitor';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIPlanner": AIPlanner,
    "Alerts": Alerts,
    "AlertsDashboard": AlertsDashboard,
    "Culture": Culture,
    "CultureDetail": CultureDetail,
    "DestinationDetail": DestinationDetail,
    "Destinations": Destinations,
    "ExperienceDetail": ExperienceDetail,
    "Experiences": Experiences,
    "Forum": Forum,
    "ForumPost": ForumPost,
    "Home": Home,
    "HostDashboard": HostDashboard,
    "HostProfile": HostProfile,
    "Maps": Maps,
    "MyBookings": MyBookings,
    "MyPlans": MyPlans,
    "Profile": Profile,
    "Trekking": Trekking,
    "TrekkingDetail": TrekkingDetail,
    "Dashboard": Dashboard,
    "DocumentManager": DocumentManager,
    "IoTMonitor": IoTMonitor,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};