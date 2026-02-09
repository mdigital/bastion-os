import { useState } from 'react';
import { Menu, CheckCircle2, Settings as SettingsIcon, LogOut } from 'lucide-react';
import bastionLogo from 'figma:asset/e8cc92e50e4bec12d7072751f5c98ec62072d6ee.png';
import { HomePage } from './components/HomePage';
import { BriefListingPage } from './components/BriefListingPage';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AdminContainer } from './components/AdminContainer';
import { UploadStep } from './components/UploadStep';
import { KeyInformationStep } from './components/KeyInformationStep';
import { DepartmentTriageStep } from './components/DepartmentTriageStep';
import { BriefSectionsStep } from './components/BriefSectionsStep';
import { UploadModal } from './components/UploadModal';
import { ComparisonView } from './components/ComparisonView';
import { HamburgerMenu } from './components/HamburgerMenu';
import { BriefApprovalView } from './components/BriefApprovalView';
import { Login } from './components/Login';
import { SavedBrief } from './types/SavedBrief';
import { KeyInfo } from './types/KeyInfo';
import { SectionData } from './types/SectionData';
import { defaultSections } from './data/defaultSections';
import { fastForwardSections } from './data/fastForwardSections';

type Step = 'upload' | 'keyInfo' | 'triage' | 'sections';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'listing' | 'brief' | 'knowledgeBase' | 'admin' | 'approval'>('home');
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [currentBriefId, setCurrentBriefId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // User info
  const userName = 'Sarah Chen';
  const userEmail = 'sarah.chen@strength.agency';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>([
    {
      id: '1',
      client: 'Acme Corporation',
      jobToBeDone: 'Launch new sustainable product line with integrated marketing campaign',
      budget: '$250,000',
      dueDate: '2025-02-15',
      status: 'draft',
      lastModified: '2025-11-28T10:30:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'Acme Corporation',
        jobToBeDone: 'Launch new sustainable product line with integrated marketing campaign',
        budget: '$250,000',
        dueDate: '2025-02-15',
        liveDate: '2025-03-01',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '2',
      client: 'TechStart Inc',
      jobToBeDone: 'Brand awareness campaign for new SaaS platform',
      budget: '$150,000',
      dueDate: '2025-03-20',
      status: 'finalized',
      lastModified: '2025-11-25T14:22:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'TechStart Inc',
        jobToBeDone: 'Brand awareness campaign for new SaaS platform',
        budget: '$150,000',
        dueDate: '2025-03-20',
        liveDate: '2025-04-01',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '3',
      client: 'GreenLife Foods',
      jobToBeDone: 'Product launch and PR campaign for organic snack line',
      budget: '$80,000',
      dueDate: '2025-01-30',
      status: 'draft',
      lastModified: '2025-12-01T09:15:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'GreenLife Foods',
        jobToBeDone: 'Product launch and PR campaign for organic snack line',
        budget: '$80,000',
        dueDate: '2025-01-30',
        liveDate: '2025-02-15',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '4',
      client: 'Urban Fitness Co',
      jobToBeDone: 'Digital marketing strategy for new fitness app launch',
      budget: '$120,000',
      dueDate: '2025-02-28',
      status: 'finalized',
      lastModified: '2025-12-02T11:45:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'Urban Fitness Co',
        jobToBeDone: 'Digital marketing strategy for new fitness app launch',
        budget: '$120,000',
        dueDate: '2025-02-28',
        liveDate: '2025-03-15',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '5',
      client: 'Luxe Beauty',
      jobToBeDone: 'Influencer campaign for premium skincare range',
      budget: '$95,000',
      dueDate: '2025-03-10',
      status: 'draft',
      lastModified: '2025-12-03T08:20:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'Luxe Beauty',
        jobToBeDone: 'Influencer campaign for premium skincare range',
        budget: '$95,000',
        dueDate: '2025-03-10',
        liveDate: '2025-03-25',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '6',
      client: 'Momentum Ventures',
      jobToBeDone: 'Corporate rebrand and website redesign',
      budget: '$180,000',
      dueDate: '2025-04-15',
      status: 'finalized',
      lastModified: '2025-11-29T16:30:00',
      leadDepartment: 'Creative',
      keyInfo: {
        client: 'Momentum Ventures',
        jobToBeDone: 'Corporate rebrand and website redesign',
        budget: '$180,000',
        dueDate: '2025-04-15',
        liveDate: '2025-05-01',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '7',
      client: 'EcoHome Solutions',
      jobToBeDone: 'Sustainability campaign for eco-friendly home products',
      budget: '$75,000',
      dueDate: '2025-02-20',
      status: 'draft',
      lastModified: '2025-12-04T13:15:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'EcoHome Solutions',
        jobToBeDone: 'Sustainability campaign for eco-friendly home products',
        budget: '$75,000',
        dueDate: '2025-02-20',
        liveDate: '2025-03-05',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '8',
      client: 'NextGen Education',
      jobToBeDone: 'Student recruitment campaign for online courses',
      budget: '$110,000',
      dueDate: '2025-03-25',
      status: 'finalized',
      lastModified: '2025-11-30T10:00:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'NextGen Education',
        jobToBeDone: 'Student recruitment campaign for online courses',
        budget: '$110,000',
        dueDate: '2025-03-25',
        liveDate: '2025-04-10',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '9',
      client: 'Artisan Coffee Co',
      jobToBeDone: 'Social media content series for new coffee blend',
      budget: '$45,000',
      dueDate: '2025-01-25',
      status: 'draft',
      lastModified: '2025-12-05T09:30:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'Artisan Coffee Co',
        jobToBeDone: 'Social media content series for new coffee blend',
        budget: '$45,000',
        dueDate: '2025-01-25',
        liveDate: '2025-02-08',
        campaignDuration: '2 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '10',
      client: 'Peak Performance Sports',
      jobToBeDone: 'Experiential marketing for new sportswear line',
      budget: '$200,000',
      dueDate: '2025-04-30',
      status: 'finalized',
      lastModified: '2025-12-01T14:45:00',
      leadDepartment: 'Experiential',
      keyInfo: {
        client: 'Peak Performance Sports',
        jobToBeDone: 'Experiential marketing for new sportswear line',
        budget: '$200,000',
        dueDate: '2025-04-30',
        liveDate: '2025-05-15',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '11',
      client: 'CloudTech Solutions',
      jobToBeDone: 'B2B lead generation campaign for cloud services',
      budget: '$130,000',
      dueDate: '2025-03-05',
      status: 'draft',
      lastModified: '2025-12-06T11:20:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'CloudTech Solutions',
        jobToBeDone: 'B2B lead generation campaign for cloud services',
        budget: '$130,000',
        dueDate: '2025-03-05',
        liveDate: '2025-03-20',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '12',
      client: 'Heritage Hotels',
      jobToBeDone: 'Luxury travel campaign for boutique hotel chain',
      budget: '$165,000',
      dueDate: '2025-02-10',
      status: 'finalized',
      lastModified: '2025-11-27T15:30:00',
      leadDepartment: 'Creative',
      keyInfo: {
        client: 'Heritage Hotels',
        jobToBeDone: 'Luxury travel campaign for boutique hotel chain',
        budget: '$165,000',
        dueDate: '2025-02-10',
        liveDate: '2025-02-25',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '13',
      client: 'FreshMart Groceries',
      jobToBeDone: 'Local community engagement and store opening events',
      budget: '$55,000',
      dueDate: '2025-01-20',
      status: 'draft',
      lastModified: '2025-12-07T08:45:00',
      leadDepartment: 'Experiential',
      keyInfo: {
        client: 'FreshMart Groceries',
        jobToBeDone: 'Local community engagement and store opening events',
        budget: '$55,000',
        dueDate: '2025-01-20',
        liveDate: '2025-02-01',
        campaignDuration: '2 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '14',
      client: 'Quantum Analytics',
      jobToBeDone: 'Thought leadership content for AI data platform',
      budget: '$90,000',
      dueDate: '2025-03-15',
      status: 'finalized',
      lastModified: '2025-12-02T12:10:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'Quantum Analytics',
        jobToBeDone: 'Thought leadership content for AI data platform',
        budget: '$90,000',
        dueDate: '2025-03-15',
        liveDate: '2025-03-30',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '15',
      client: 'Wellness Haven',
      jobToBeDone: 'Integrated campaign for mental health app',
      budget: '$140,000',
      dueDate: '2025-04-05',
      status: 'draft',
      lastModified: '2025-12-08T10:15:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'Wellness Haven',
        jobToBeDone: 'Integrated campaign for mental health app',
        budget: '$140,000',
        dueDate: '2025-04-05',
        liveDate: '2025-04-20',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '16',
      client: 'Metro Transport',
      jobToBeDone: 'Public awareness campaign for new transit routes',
      budget: '$175,000',
      dueDate: '2025-02-28',
      status: 'finalized',
      lastModified: '2025-11-28T14:20:00',
      leadDepartment: 'Creative',
      keyInfo: {
        client: 'Metro Transport',
        jobToBeDone: 'Public awareness campaign for new transit routes',
        budget: '$175,000',
        dueDate: '2025-02-28',
        liveDate: '2025-03-15',
        campaignDuration: '4 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '17',
      client: 'Gourmet Delights',
      jobToBeDone: 'Product photography and social content for food delivery',
      budget: '$60,000',
      dueDate: '2025-01-28',
      status: 'draft',
      lastModified: '2025-12-09T09:00:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'Gourmet Delights',
        jobToBeDone: 'Product photography and social content for food delivery',
        budget: '$60,000',
        dueDate: '2025-01-28',
        liveDate: '2025-02-12',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '18',
      client: 'SecureBank Financial',
      jobToBeDone: 'Customer trust campaign for new banking services',
      budget: '$220,000',
      dueDate: '2025-04-20',
      status: 'finalized',
      lastModified: '2025-12-01T16:00:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'SecureBank Financial',
        jobToBeDone: 'Customer trust campaign for new banking services',
        budget: '$220,000',
        dueDate: '2025-04-20',
        liveDate: '2025-05-05',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '19',
      client: 'PlayZone Games',
      jobToBeDone: 'Launch campaign for new mobile gaming app',
      budget: '$105,000',
      dueDate: '2025-03-08',
      status: 'draft',
      lastModified: '2025-12-10T11:30:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'PlayZone Games',
        jobToBeDone: 'Launch campaign for new mobile gaming app',
        budget: '$105,000',
        dueDate: '2025-03-08',
        liveDate: '2025-03-22',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '20',
      client: 'EverGreen Energy',
      jobToBeDone: 'Corporate sustainability report and PR outreach',
      budget: '$85,000',
      dueDate: '2025-02-15',
      status: 'finalized',
      lastModified: '2025-11-29T13:45:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'EverGreen Energy',
        jobToBeDone: 'Corporate sustainability report and PR outreach',
        budget: '$85,000',
        dueDate: '2025-02-15',
        liveDate: '2025-03-01',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '21',
      client: 'StyleHub Fashion',
      jobToBeDone: 'Fashion week activation and influencer partnerships',
      budget: '$195,000',
      dueDate: '2025-04-10',
      status: 'draft',
      lastModified: '2025-12-11T10:20:00',
      leadDepartment: 'Experiential',
      keyInfo: {
        client: 'StyleHub Fashion',
        jobToBeDone: 'Fashion week activation and influencer partnerships',
        budget: '$195,000',
        dueDate: '2025-04-10',
        liveDate: '2025-04-25',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '22',
      client: 'DataFlow Systems',
      jobToBeDone: 'Enterprise software demo and webinar series',
      budget: '$125,000',
      dueDate: '2025-03-12',
      status: 'finalized',
      lastModified: '2025-12-03T15:10:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'DataFlow Systems',
        jobToBeDone: 'Enterprise software demo and webinar series',
        budget: '$125,000',
        dueDate: '2025-03-12',
        liveDate: '2025-03-28',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '23',
      client: 'PetCare Plus',
      jobToBeDone: 'Seasonal campaign for pet wellness products',
      budget: '$70,000',
      dueDate: '2025-02-05',
      status: 'draft',
      lastModified: '2025-12-12T08:55:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'PetCare Plus',
        jobToBeDone: 'Seasonal campaign for pet wellness products',
        budget: '$70,000',
        dueDate: '2025-02-05',
        liveDate: '2025-02-18',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '24',
      client: 'Innovate Labs',
      jobToBeDone: 'Product launch for smart home technology',
      budget: '$210,000',
      dueDate: '2025-04-25',
      status: 'finalized',
      lastModified: '2025-12-04T12:30:00',
      leadDepartment: 'Creative',
      keyInfo: {
        client: 'Innovate Labs',
        jobToBeDone: 'Product launch for smart home technology',
        budget: '$210,000',
        dueDate: '2025-04-25',
        liveDate: '2025-05-10',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '25',
      client: 'VitalHealth Clinic',
      jobToBeDone: 'Patient education campaign for preventative care',
      budget: '$65,000',
      dueDate: '2025-01-22',
      status: 'draft',
      lastModified: '2025-12-13T09:40:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'VitalHealth Clinic',
        jobToBeDone: 'Patient education campaign for preventative care',
        budget: '$65,000',
        dueDate: '2025-01-22',
        liveDate: '2025-02-05',
        campaignDuration: '2 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '26',
      client: 'Summit Outdoor Gear',
      jobToBeDone: 'Adventure tourism partnership and content creation',
      budget: '$155,000',
      dueDate: '2025-03-18',
      status: 'finalized',
      lastModified: '2025-11-30T11:15:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'Summit Outdoor Gear',
        jobToBeDone: 'Adventure tourism partnership and content creation',
        budget: '$155,000',
        dueDate: '2025-03-18',
        liveDate: '2025-04-02',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '27',
      client: 'CityScape Properties',
      jobToBeDone: 'Luxury real estate marketing for new development',
      budget: '$240,000',
      dueDate: '2025-05-01',
      status: 'draft',
      lastModified: '2025-12-14T10:50:00',
      leadDepartment: 'Creative',
      keyInfo: {
        client: 'CityScape Properties',
        jobToBeDone: 'Luxury real estate marketing for new development',
        budget: '$240,000',
        dueDate: '2025-05-01',
        liveDate: '2025-05-18',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '28',
      client: 'FoodieBox Delivery',
      jobToBeDone: 'Referral program campaign for meal kit service',
      budget: '$80,000',
      dueDate: '2025-02-12',
      status: 'finalized',
      lastModified: '2025-12-05T14:25:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'FoodieBox Delivery',
        jobToBeDone: 'Referral program campaign for meal kit service',
        budget: '$80,000',
        dueDate: '2025-02-12',
        liveDate: '2025-02-26',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '29',
      client: 'TechTalent Recruitment',
      jobToBeDone: 'Employer branding and job seeker engagement',
      budget: '$115,000',
      dueDate: '2025-03-22',
      status: 'draft',
      lastModified: '2025-12-15T11:05:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'TechTalent Recruitment',
        jobToBeDone: 'Employer branding and job seeker engagement',
        budget: '$115,000',
        dueDate: '2025-03-22',
        liveDate: '2025-04-05',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '30',
      client: 'GreenThumb Gardening',
      jobToBeDone: 'Spring planting campaign and workshop series',
      budget: '$50,000',
      dueDate: '2025-01-18',
      status: 'finalized',
      lastModified: '2025-11-26T09:30:00',
      leadDepartment: 'Experiential',
      keyInfo: {
        client: 'GreenThumb Gardening',
        jobToBeDone: 'Spring planting campaign and workshop series',
        budget: '$50,000',
        dueDate: '2025-01-18',
        liveDate: '2025-02-01',
        campaignDuration: '2 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '31',
      client: 'AutoDrive Motors',
      jobToBeDone: 'Electric vehicle launch and test drive events',
      budget: '$280,000',
      dueDate: '2025-05-10',
      status: 'draft',
      lastModified: '2025-12-16T12:20:00',
      leadDepartment: 'Experiential',
      keyInfo: {
        client: 'AutoDrive Motors',
        jobToBeDone: 'Electric vehicle launch and test drive events',
        budget: '$280,000',
        dueDate: '2025-05-10',
        liveDate: '2025-05-25',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '32',
      client: 'BookNest Publishing',
      jobToBeDone: 'Author tour and book launch publicity',
      budget: '$75,000',
      dueDate: '2025-02-25',
      status: 'finalized',
      lastModified: '2025-12-06T15:45:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'BookNest Publishing',
        jobToBeDone: 'Author tour and book launch publicity',
        budget: '$75,000',
        dueDate: '2025-02-25',
        liveDate: '2025-03-10',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '33',
      client: 'BlueWave Maritime',
      jobToBeDone: 'Corporate communications for shipping services',
      budget: '$145,000',
      dueDate: '2025-03-30',
      status: 'draft',
      lastModified: '2025-12-17T10:35:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'BlueWave Maritime',
        jobToBeDone: 'Corporate communications for shipping services',
        budget: '$145,000',
        dueDate: '2025-03-30',
        liveDate: '2025-04-15',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '34',
      client: 'SparkLab Innovation',
      jobToBeDone: 'Startup accelerator programme promotion',
      budget: '$95,000',
      dueDate: '2025-02-18',
      status: 'finalized',
      lastModified: '2025-12-07T13:00:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'SparkLab Innovation',
        jobToBeDone: 'Startup accelerator programme promotion',
        budget: '$95,000',
        dueDate: '2025-02-18',
        liveDate: '2025-03-05',
        campaignDuration: '3 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '35',
      client: 'FlavorFusion Restaurants',
      jobToBeDone: 'New menu launch and culinary experience marketing',
      budget: '$110,000',
      dueDate: '2025-03-28',
      status: 'draft',
      lastModified: '2025-12-18T09:15:00',
      leadDepartment: 'Social',
      keyInfo: {
        client: 'FlavorFusion Restaurants',
        jobToBeDone: 'New menu launch and culinary experience marketing',
        budget: '$110,000',
        dueDate: '2025-03-28',
        liveDate: '2025-04-12',
        campaignDuration: '4 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '36',
      client: 'SafeHome Security',
      jobToBeDone: 'Smart security system awareness campaign',
      budget: '$160,000',
      dueDate: '2025-04-08',
      status: 'finalized',
      lastModified: '2025-12-08T14:50:00',
      leadDepartment: 'Creative',
      keyInfo: {
        client: 'SafeHome Security',
        jobToBeDone: 'Smart security system awareness campaign',
        budget: '$160,000',
        dueDate: '2025-04-08',
        liveDate: '2025-04-22',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '37',
      client: 'WanderLust Travel',
      jobToBeDone: 'Destination marketing for exotic tour packages',
      budget: '$185,000',
      dueDate: '2025-05-05',
      status: 'draft',
      lastModified: '2025-12-19T11:40:00',
      leadDepartment: 'Creative',
      keyInfo: {
        client: 'WanderLust Travel',
        jobToBeDone: 'Destination marketing for exotic tour packages',
        budget: '$185,000',
        dueDate: '2025-05-05',
        liveDate: '2025-05-20',
        campaignDuration: '6 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '38',
      client: 'MindfulMoments App',
      jobToBeDone: 'Meditation app subscription growth campaign',
      budget: '$100,000',
      dueDate: '2025-03-02',
      status: 'finalized',
      lastModified: '2025-12-09T16:10:00',
      leadDepartment: 'Digital',
      keyInfo: {
        client: 'MindfulMoments App',
        jobToBeDone: 'Meditation app subscription growth campaign',
        budget: '$100,000',
        dueDate: '2025-03-02',
        liveDate: '2025-03-18',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    },
    {
      id: '39',
      client: 'CraftBrew Collective',
      jobToBeDone: 'Craft beer festival sponsorship and activation',
      budget: '$135,000',
      dueDate: '2025-04-12',
      status: 'draft',
      lastModified: '2025-12-20T10:25:00',
      leadDepartment: 'Experiential',
      keyInfo: {
        client: 'CraftBrew Collective',
        jobToBeDone: 'Craft beer festival sponsorship and activation',
        budget: '$135,000',
        dueDate: '2025-04-12',
        liveDate: '2025-04-28',
        campaignDuration: '5 months',
        briefLevel: 'New Project Brief'
      },
      sections: []
    },
    {
      id: '40',
      client: 'LegalEase Services',
      jobToBeDone: 'Law firm thought leadership and client acquisition',
      budget: '$120,000',
      dueDate: '2025-03-16',
      status: 'finalized',
      lastModified: '2025-12-10T12:55:00',
      leadDepartment: 'PR',
      keyInfo: {
        client: 'LegalEase Services',
        jobToBeDone: 'Law firm thought leadership and client acquisition',
        budget: '$120,000',
        dueDate: '2025-03-16',
        liveDate: '2025-04-01',
        campaignDuration: '4 months',
        briefLevel: 'Fast Forward Brief'
      },
      sections: []
    }
  ]);
  
  const [keyInfo, setKeyInfo] = useState<KeyInfo>({
    client: 'Acme Corporation',
    jobToBeDone: 'Launch integrated multi-channel campaign for new sustainable product line targeting environmentally conscious millennials and Gen Z consumers',
    budget: '$250,000',
    dueDate: '2025-03-15',
    liveDate: '2025-04-01',
    campaignDuration: '6 months',
    briefLevel: 'New Project Brief'
  });

  const [sections, setSections] = useState<SectionData[]>(defaultSections);
  const [leadDepartment, setLeadDepartment] = useState('Digital');
  const [supportingDepartments, setSupportingDepartments] = useState(['Social', 'Creative', 'PR']);
  const [approverComments, setApproverComments] = useState<{ [key: number]: { comment: string; approverName: string; actioned: boolean } }>({
    0: {
      comment: "Great start on the objective, but please add specific success metrics - what does 'market leadership' mean quantitatively? Also, clarify the timeline for achieving these objectives.",
      approverName: "Sarah Chen",
      actioned: false
    },
    2: {
      comment: "The target audience definition needs more depth. Can we include specific psychographics, media consumption habits, and purchase behaviour patterns?",
      approverName: "Marcus Thompson",
      actioned: false
    }
  });

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    // Simulate processing
    setTimeout(() => {
      setCurrentStep('keyInfo');
    }, 1500);
  };

  const handleKeyInfoEdit = (field: keyof KeyInfo, value: string) => {
    const updatedKeyInfo = { ...keyInfo, [field]: value };
    setKeyInfo(updatedKeyInfo);
    
    // If briefLevel changes, update sections accordingly
    if (field === 'briefLevel') {
      if (value === 'Fast Forward Brief') {
        setSections(fastForwardSections);
      } else {
        setSections(defaultSections);
      }
    }
  };

  const handleSectionUpdate = (index: number, content: string) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
  };

  const handleFinalize = () => {
    // Save as finalized
    const briefToSave: SavedBrief = {
      id: currentBriefId || Date.now().toString(),
      client: keyInfo.client,
      jobToBeDone: keyInfo.jobToBeDone,
      budget: keyInfo.budget,
      dueDate: keyInfo.dueDate,
      status: 'finalized',
      lastModified: new Date().toISOString(),
      leadDepartment: 'Digital',
      keyInfo: keyInfo,
      sections: sections
    };

    if (currentBriefId) {
      // Update existing
      setSavedBriefs(savedBriefs.map(b => b.id === currentBriefId ? briefToSave : b));
    } else {
      // Add new
      setSavedBriefs([briefToSave, ...savedBriefs]);
    }

    alert('Brief finalized! In production, this would export the enhanced brief.');
    setCurrentView('listing');
  };

  const handleSaveDraft = () => {
    const briefToSave: SavedBrief = {
      id: currentBriefId || Date.now().toString(),
      client: keyInfo.client,
      jobToBeDone: keyInfo.jobToBeDone,
      budget: keyInfo.budget,
      dueDate: keyInfo.dueDate,
      status: 'draft',
      lastModified: new Date().toISOString(),
      leadDepartment: 'Digital',
      keyInfo: keyInfo,
      sections: sections
    };

    if (currentBriefId) {
      // Update existing
      setSavedBriefs(savedBriefs.map(b => b.id === currentBriefId ? briefToSave : b));
    } else {
      // Add new
      setSavedBriefs([briefToSave, ...savedBriefs]);
      setCurrentBriefId(briefToSave.id);
    }

    // Navigate to listing page
    setCurrentView('listing');
  };

  const handleSelectBrief = (id: string) => {
    const brief = savedBriefs.find(b => b.id === id);
    if (brief) {
      setCurrentBriefId(id);
      setKeyInfo(brief.keyInfo);
      setSections(brief.sections.length > 0 ? brief.sections : sections);
      setCurrentStep('sections');
      setCurrentView('brief');
    }
  };

  const handleNewBrief = () => {
    // Reset everything for a new brief with demo data pre-filled
    setCurrentBriefId(null);
    setKeyInfo({
      client: 'Acme Corporation',
      jobToBeDone: 'Launch integrated multi-channel campaign for new sustainable product line targeting environmentally conscious millennials and Gen Z consumers',
      budget: '$250,000',
      dueDate: '2025-03-15',
      liveDate: '2025-04-01',
      campaignDuration: '6 months',
      briefLevel: 'New Project Brief'
    });
    // Use the same detailed sections as the initial state
    setSections(sections);
    setCurrentStep('upload');
    setCurrentView('brief');
  };

  const handleArchiveBrief = (id: string) => {
    setSavedBriefs(savedBriefs.map(b => 
      b.id === id ? { ...b, archived: true } : b
    ));
  };

  const handleUnarchiveBrief = (id: string) => {
    setSavedBriefs(savedBriefs.map(b => 
      b.id === id ? { ...b, archived: false } : b
    ));
  };

  const handleUploadMore = () => {
    setShowUploadModal(true);
  };

  const handleMarkCommentActioned = (sectionIndex: number) => {
    const updatedComments = {
      ...approverComments,
      [sectionIndex]: {
        ...approverComments[sectionIndex],
        actioned: true
      }
    };
    setApproverComments(updatedComments);
  };

  const handleAdditionalUpload = (file: File) => {
    // Simulate processing the additional file and generating comparisons
    setTimeout(() => {
      setShowComparison(true);
    }, 1000);
  };

  const handleAcceptChanges = (updatedSections: string[]) => {
    // Update all sections with the new content
    const newSections = sections.map((section, index) => ({
      ...section,
      content: updatedSections[index]
    }));
    setSections(newSections);
    setShowComparison(false);
  };

  const handleAcceptSection = (index: number, content: string) => {
    // Update just this section, but don't return to brief view yet
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
    // Don't close comparison view - let ComparisonView handle that when all sections are done
  };

  const handleRejectSection = (index: number) => {
    // Don't update anything for this section
    // Don't close comparison view - let ComparisonView handle that when all sections are done
  };

  const handleCancelComparison = () => {
    setShowComparison(false);
  };

  // Mock comparison data - in production, this would be generated by AI
  const mockComparisons = sections.map((section) => ({
    title: section.title,
    original: section.content,
    updated: section.content + ' <mark>Based on the new information provided, we recommend expanding this section to include more specific details about stakeholder engagement and timeline considerations.</mark>'
  }));

  const steps = [
    { id: 'upload', label: 'Upload' },
    { id: 'keyInfo', label: 'Key Info' },
    { id: 'triage', label: 'Triage' },
    { id: 'sections', label: 'Enhancement' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleStepClick = (stepId: Step, index: number) => {
    // Only allow clicking on current step or previous steps
    if (index <= currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsUserDropdownOpen(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-bone">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="px-8 py-4 flex items-center justify-between">
          {/* Left: App Name */}
          <div className="flex items-center gap-3">
            <img 
              src={bastionLogo} 
              alt="Bastion OS" 
              className="h-6 cursor-pointer" 
              onClick={() => setCurrentView('home')}
            />
          </div>

          {/* Right: Menu, Profile */}
          <div className="flex items-center gap-2 relative">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative">
              <button 
                className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <span className="text-sm font-bold">{userInitials}</span>
              </button>
              
              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <>
                  {/* Overlay to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-12 bg-white border border-gray-200 shadow-lg rounded-lg z-50 w-64">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-sm">{userName}</p>
                      <p className="text-xs text-gray-500 mt-1">{userEmail}</p>
                    </div>
                    <div className="py-2">
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          // Handle Personal Settings navigation
                        }}
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Personal Settings</span>
                      </button>
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMenuOpen(false);
        }}
        onLogout={handleLogout}
      />

      {currentView === 'home' ? (
        <main className="max-w-screen-2xl mx-auto px-8 py-12">
          <HomePage
            onNavigateToFeature={(feature) => {
              if (feature === 'briefEnhancer') {
                setCurrentView('listing');
              } else if (feature === 'knowledgeBase') {
                setCurrentView('knowledgeBase');
              } else if (feature === 'admin') {
                setCurrentView('admin');
              }
            }}
            onNewBrief={handleNewBrief}
          />
        </main>
      ) : currentView === 'knowledgeBase' ? (
        <main className="max-w-screen-2xl mx-auto px-8 py-12">
          <KnowledgeBase onBack={() => setCurrentView('home')} />
        </main>
      ) : currentView === 'listing' ? (
        <main className="max-w-screen-2xl mx-auto px-8 py-12">
          <BriefListingPage
            briefs={savedBriefs}
            onSelectBrief={handleSelectBrief}
            onNewBrief={handleNewBrief}
            onArchiveBrief={handleArchiveBrief}
            onUnarchiveBrief={handleUnarchiveBrief}
          />
        </main>
      ) : currentView === 'admin' ? (
        <main className="max-w-screen-2xl mx-auto px-8 py-12">
          <AdminContainer onBack={() => setCurrentView('home')} />
        </main>
      ) : currentView === 'approval' ? (
        <main className="max-w-screen-2xl mx-auto px-8 py-12">
          <BriefApprovalView 
            sections={sections}
            keyInfo={keyInfo}
            leadDepartment={leadDepartment}
            supportingDepartments={supportingDepartments}
            approverName="Sarah Chen"
            comments={approverComments}
            onCommentsChange={setApproverComments}
            onBack={() => setCurrentView('brief')}
            onApprove={() => {
              alert('Brief approved! In production, this would notify the brief creator.');
              setCurrentView('brief');
            }}
          />
        </main>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-screen-2xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div 
                      className={`flex items-center gap-3 ${
                        index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                      onClick={() => handleStepClick(step.id as Step, index)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          index < currentStepIndex
                            ? 'bg-yellow-400 border-yellow-400 hover:bg-yellow-500'
                            : index === currentStepIndex
                            ? 'bg-black border-black text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {index < currentStepIndex ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`${
                          index <= currentStepIndex ? 'text-black' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          index < currentStepIndex ? 'bg-yellow-400' : 'bg-gray-200'
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-screen-2xl mx-auto px-8 py-12">
            {currentStep === 'upload' && <UploadStep onUpload={handleFileUpload} />}
            
            {currentStep === 'keyInfo' && (
              <KeyInformationStep
                keyInfo={keyInfo}
                onNext={() => setCurrentStep('triage')}
                onEdit={handleKeyInfoEdit}
                onBack={() => setCurrentStep('upload')}
              />
            )}
            
            {currentStep === 'triage' && (
              <DepartmentTriageStep
                briefLevel={keyInfo.briefLevel}
                leadDepartment={leadDepartment}
                supportingDepartments={supportingDepartments}
                rationale="This campaign requires a digital-first approach given the target audience of Millennials and Gen Z who are primarily reached through online channels. The brief emphasizes social media engagement and digital advertising as key components. Digital should lead the strategy with Social providing content expertise, Creative developing the brand narrative, and PR managing reputation and thought leadership aspects."
                onBriefLevelChange={(level) => handleKeyInfoEdit('briefLevel', level)}
                onLeadDepartmentChange={setLeadDepartment}
                onSupportingDepartmentsChange={setSupportingDepartments}
                onNext={() => setCurrentStep('sections')}
                onBack={() => setCurrentStep('keyInfo')}
              />
            )}
            
            {currentStep === 'sections' && !showComparison && (
              <BriefSectionsStep
                sections={sections}
                keyInfo={keyInfo}
                leadDepartment={leadDepartment}
                supportingDepartments={supportingDepartments}
                onSectionUpdate={handleSectionUpdate}
                onFinalize={handleFinalize}
                onUploadMore={handleUploadMore}
                onSaveDraft={handleSaveDraft}
                onBriefLevelChange={(level) => handleKeyInfoEdit('briefLevel', level)}
                onLeadDepartmentChange={setLeadDepartment}
                onSupportingDepartmentsChange={setSupportingDepartments}
                onKeyInfoChange={handleKeyInfoEdit}
                onViewAsApprover={() => setCurrentView('approval')}
                approverComments={approverComments}
                onMarkCommentActioned={handleMarkCommentActioned}
              />
            )}

            {currentStep === 'sections' && showComparison && (
              <ComparisonView
                comparisons={mockComparisons}
                onAcceptAll={handleAcceptChanges}
                onAcceptSection={handleAcceptSection}
                onRejectSection={handleRejectSection}
                onCancel={handleCancelComparison}
              />
            )}
          </main>

          {/* Upload Modal */}
          {showUploadModal && (
            <UploadModal
              onClose={() => setShowUploadModal(false)}
              onUpload={handleAdditionalUpload}
            />
          )}
        </>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-20">
        <div className="max-w-screen-2xl mx-auto px-8 text-center">
          <p>Bastion OS • Powered by AI • © 2025</p>
        </div>
      </footer>
    </div>
  );
}