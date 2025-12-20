import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Trekking from './pages/Trekking';
import TrekkingDetail from './pages/TrekkingDetail';
import Culture from './pages/Culture';
import CultureDetail from './pages/CultureDetail';
import MyPlans from './pages/MyPlans';
import AIPlanner from './pages/AIPlanner';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import Maps from './pages/Maps';
import Alerts from './pages/Alerts';
import Experiences from './pages/Experiences';
import ExperienceDetail from './pages/ExperienceDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AlertsDashboard from './pages/AlertsDashboard';
import HostDashboard from './pages/HostDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Destinations": Destinations,
    "DestinationDetail": DestinationDetail,
    "Trekking": Trekking,
    "TrekkingDetail": TrekkingDetail,
    "Culture": Culture,
    "CultureDetail": CultureDetail,
    "MyPlans": MyPlans,
    "AIPlanner": AIPlanner,
    "Forum": Forum,
    "ForumPost": ForumPost,
    "Maps": Maps,
    "Alerts": Alerts,
    "Experiences": Experiences,
    "ExperienceDetail": ExperienceDetail,
    "MyBookings": MyBookings,
    "Profile": Profile,
    "AlertsDashboard": AlertsDashboard,
    "HostDashboard": HostDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};