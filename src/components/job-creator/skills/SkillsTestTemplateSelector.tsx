import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Code, 
  Palette, 
  Megaphone, 
  UserCheck, 
  FileText, 
  Plus,
  Video,
  Sparkles,
  PenTool,
  Calendar,
  MessageCircle,
  Edit3,
  ClipboardList,
  Users,
  TrendingUp,
  BarChart3,
  Calculator,
  Smartphone,
  Server,
  Shield,
  Database,
  Monitor,
  Camera,
  Brush,
  Gamepad2,
  Search,
  Mail,
  Globe,
  Zap,
  Mic,
  Phone,
  Building,
  Target,
  HeadphonesIcon,
  LineChart,
  DollarSign,
  Briefcase,
  UserPlus
} from "lucide-react";
import { SkillsTestTemplate } from "@/types/skillsAssessment";

interface SkillsTestTemplateSelectorProps {
  onSelectTemplate: (template: SkillsTestTemplate | null) => void;
  onBack: () => void;
}

const templates: SkillsTestTemplate[] = [
  {
    id: 'custom',
    name: 'Custom Template',
    description: 'Start from scratch and build your own assessment',
    category: 'custom',
    questions: [],
    estimatedTime: 0,
    icon: 'Plus'
  },
  // DEVELOPER CATEGORY
  {
    id: 'developer',
    name: 'Software Developer',
    description: 'Code submission, portfolio review, and technical questions',
    category: 'developer',
    estimatedTime: 45,
    questions: [
      {
        question: 'Please share a link to your GitHub profile or portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link to your best coding work',
        evaluationGuidelines: 'Look for clean code, good documentation, and project diversity',
        required: true,
        order: 1
      },
      {
        question: 'Solve this coding challenge',
        type: 'code_submission',
        candidateInstructions: 'Write a function that finds the longest palindromic substring',
        evaluationGuidelines: 'Check for efficiency, edge case handling, and code clarity',
        required: true,
        order: 2
      }
    ]
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'UI implementation, responsive design, and JavaScript skills',
    category: 'developer',
    estimatedTime: 40,
    questions: [
      {
        question: 'Share your frontend portfolio or live projects',
        type: 'portfolio_link',
        candidateInstructions: 'Show your best responsive web applications',
        evaluationGuidelines: 'Assess visual design, code quality, and user experience',
        required: true,
        order: 1
      },
      {
        question: 'How would you optimize a React application for performance?',
        type: 'long_text',
        candidateInstructions: 'Discuss specific techniques and tools you would use',
        evaluationGuidelines: 'Look for knowledge of React best practices, bundling, and performance metrics',
        required: true,
        order: 2,
        characterLimit: 600
      }
    ],
    icon: 'Monitor'
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    description: 'API design, database optimization, and server architecture',
    category: 'developer',
    estimatedTime: 50,
    questions: [
      {
        question: 'Design a RESTful API for a social media platform',
        type: 'long_text',
        candidateInstructions: 'Include endpoints, data models, and authentication strategy',
        evaluationGuidelines: 'Evaluate API design principles, scalability considerations, and security awareness',
        required: true,
        order: 1,
        characterLimit: 800
      },
      {
        question: 'Share examples of backend systems you\'ve built',
        type: 'portfolio_link',
        candidateInstructions: 'Include documentation or code repositories',
        evaluationGuidelines: 'Look for system design skills, code organization, and documentation quality',
        required: true,
        order: 2
      }
    ],
    icon: 'Server'
  },
  {
    id: 'mobile-developer',
    name: 'Mobile App Developer',
    description: 'Native/cross-platform development and mobile UX',
    category: 'developer',
    estimatedTime: 45,
    questions: [
      {
        question: 'Share your mobile app portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Include App Store/Play Store links or demo videos',
        evaluationGuidelines: 'Assess app quality, user experience, and technical implementation',
        required: true,
        order: 1
      },
      {
        question: 'How do you handle offline functionality in mobile apps?',
        type: 'text',
        candidateInstructions: 'Describe your approach to data synchronization and caching',
        evaluationGuidelines: 'Look for understanding of mobile-specific challenges and solutions',
        required: true,
        order: 2
      }
    ],
    icon: 'Smartphone'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'CI/CD, infrastructure automation, and cloud platforms',
    category: 'developer',
    estimatedTime: 40,
    questions: [
      {
        question: 'Describe a CI/CD pipeline you\'ve implemented',
        type: 'long_text',
        candidateInstructions: 'Include tools used, deployment strategies, and monitoring',
        evaluationGuidelines: 'Evaluate automation skills, tool knowledge, and best practices',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'How would you handle a production outage?',
        type: 'text',
        candidateInstructions: 'Walk through your incident response process',
        evaluationGuidelines: 'Look for systematic approach, communication skills, and learning mindset',
        required: true,
        order: 2
      }
    ],
    icon: 'Shield'
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    description: 'Data pipelines, ETL processes, and big data technologies',
    category: 'developer',
    estimatedTime: 45,
    questions: [
      {
        question: 'Design a data pipeline for processing user events',
        type: 'long_text',
        candidateInstructions: 'Include data sources, processing steps, and storage solutions',
        evaluationGuidelines: 'Assess understanding of data architecture, scalability, and reliability',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'What tools and technologies do you use for data processing?',
        type: 'text',
        candidateInstructions: 'List your experience with different data technologies',
        evaluationGuidelines: 'Look for breadth of knowledge and hands-on experience',
        required: true,
        order: 2
      }
    ],
    icon: 'Database'
  },

  // DESIGNER CATEGORY
  {
    id: 'designer',
    name: 'UI/UX Designer',
    description: 'Portfolio review, design challenge, and case study',
    category: 'designer',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your design portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link to your best design work',
        evaluationGuidelines: 'Assess visual design skills, user experience thinking, and project variety',
        required: true,
        order: 1
      },
      {
        question: 'Describe your design process for a recent project',
        type: 'long_text',
        candidateInstructions: 'Walk us through your approach from research to final design',
        evaluationGuidelines: 'Look for structured thinking, user-centered approach, and problem-solving skills',
        required: true,
        order: 2,
        characterLimit: 1000
      }
    ]
  },
  {
    id: 'product-designer',
    name: 'Product Designer',
    description: 'User research, product strategy, and design systems',
    category: 'designer',
    estimatedTime: 40,
    questions: [
      {
        question: 'How do you validate design decisions with users?',
        type: 'long_text',
        candidateInstructions: 'Describe your user research and testing methods',
        evaluationGuidelines: 'Look for user-centered approach and data-driven decision making',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Share a product design case study',
        type: 'portfolio_link',
        candidateInstructions: 'Show your end-to-end product design process',
        evaluationGuidelines: 'Assess strategic thinking, process, and business impact',
        required: true,
        order: 2
      }
    ],
    icon: 'Target'
  },
  {
    id: 'web-designer',
    name: 'Web Designer',
    description: 'Visual design, responsive layouts, and web standards',
    category: 'designer',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your web design portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Include responsive websites and design systems',
        evaluationGuidelines: 'Look for visual hierarchy, responsive design, and web usability',
        required: true,
        order: 1
      },
      {
        question: 'How do you ensure accessibility in your designs?',
        type: 'text',
        candidateInstructions: 'Describe your approach to inclusive design',
        evaluationGuidelines: 'Assess knowledge of accessibility standards and inclusive practices',
        required: true,
        order: 2
      }
    ],
    icon: 'Globe'
  },
  {
    id: 'brand-designer',
    name: 'Brand Designer',
    description: 'Brand identity, visual guidelines, and brand strategy',
    category: 'designer',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your brand design portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Include logo designs, brand guidelines, and identity systems',
        evaluationGuidelines: 'Look for strategic thinking, visual consistency, and brand storytelling',
        required: true,
        order: 1
      },
      {
        question: 'How do you develop a brand strategy?',
        type: 'long_text',
        candidateInstructions: 'Walk through your brand development process',
        evaluationGuidelines: 'Assess strategic approach, research methods, and client collaboration',
        required: true,
        order: 2,
        characterLimit: 600
      }
    ],
    icon: 'Brush'
  },

  // CREATIVE CATEGORY
  {
    id: 'video-editor',
    name: 'Video Editor',
    description: 'Portfolio reel, technical skills, and creative brief response',
    category: 'creative',
    estimatedTime: 40,
    questions: [
      {
        question: 'Share your video editing portfolio or demo reel',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link to your best video editing work (YouTube, Vimeo, etc.)',
        evaluationGuidelines: 'Assess technical proficiency, creativity, pacing, and storytelling ability',
        required: true,
        order: 1
      },
      {
        question: 'What video editing software are you most proficient in and why?',
        type: 'text',
        candidateInstructions: 'Describe your experience with different editing platforms',
        evaluationGuidelines: 'Look for depth of knowledge and tool expertise',
        required: true,
        order: 2
      },
      {
        question: 'Describe how you would approach editing a 30-second promotional video',
        type: 'long_text',
        candidateInstructions: 'Walk through your process from raw footage to final cut',
        evaluationGuidelines: 'Evaluate workflow understanding and creative process',
        required: true,
        order: 3,
        characterLimit: 600
      }
    ]
  },
  {
    id: 'animator-vfx',
    name: 'Animator/VFX Artist',
    description: 'Demo reel, animation techniques, and software proficiency',
    category: 'creative',
    estimatedTime: 45,
    questions: [
      {
        question: 'Upload your animation/VFX demo reel',
        type: 'video_upload',
        candidateInstructions: 'Show your best work in a 1-2 minute reel',
        evaluationGuidelines: 'Assess technical skill, creativity, and understanding of animation principles',
        required: true,
        order: 1,
        timeLimit: 3
      },
      {
        question: 'Which animation software do you specialize in?',
        type: 'text',
        candidateInstructions: 'List your primary tools and your proficiency level with each',
        evaluationGuidelines: 'Look for relevant software knowledge and depth of experience',
        required: true,
        order: 2
      },
      {
        question: 'Explain the 12 principles of animation and how you apply them',
        type: 'long_text',
        candidateInstructions: 'Choose 3-4 principles and give specific examples from your work',
        evaluationGuidelines: 'Test fundamental animation knowledge and practical application',
        required: true,
        order: 3,
        characterLimit: 800
      }
    ]
  },
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    description: 'Portfolio showcase, brand design challenge, and design process',
    category: 'creative',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your graphic design portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link showcasing your design range and style',
        evaluationGuidelines: 'Look for visual hierarchy, typography, color theory, and brand consistency',
        required: true,
        order: 1
      },
      {
        question: 'Create a simple logo concept for a fictional eco-friendly startup',
        type: 'file_upload',
        candidateInstructions: 'Upload a PDF or image file with your logo design and brief explanation',
        evaluationGuidelines: 'Assess creativity, brand understanding, and design execution',
        allowedFileTypes: ['pdf', 'jpg', 'png', 'svg'],
        required: true,
        order: 2
      },
      {
        question: 'How do you ensure your designs align with brand guidelines?',
        type: 'text',
        candidateInstructions: 'Describe your process for maintaining brand consistency',
        evaluationGuidelines: 'Look for understanding of brand strategy and attention to detail',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'photographer',
    name: 'Photographer',
    description: 'Portfolio showcase, technical knowledge, and creative vision',
    category: 'creative',
    estimatedTime: 30,
    questions: [
      {
        question: 'Share your photography portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Include your best work across different styles or specialties',
        evaluationGuidelines: 'Assess technical skill, artistic vision, and consistency',
        required: true,
        order: 1
      },
      {
        question: 'Describe your approach to lighting in different scenarios',
        type: 'text',
        candidateInstructions: 'Explain how you handle natural vs artificial lighting',
        evaluationGuidelines: 'Look for technical knowledge and problem-solving skills',
        required: true,
        order: 2
      },
      {
        question: 'What post-processing workflow do you use?',
        type: 'text',
        candidateInstructions: 'Describe your editing process and preferred software',
        evaluationGuidelines: 'Assess workflow efficiency and technical proficiency',
        required: true,
        order: 3
      }
    ],
    icon: 'Camera'
  },
  {
    id: 'illustrator',
    name: 'Illustrator',
    description: 'Artistic portfolio, style versatility, and creative process',
    category: 'creative',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your illustration portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Show range of styles and illustration types',
        evaluationGuidelines: 'Look for artistic skill, style consistency, and creative range',
        required: true,
        order: 1
      },
      {
        question: 'How do you adapt your style for different clients or projects?',
        type: 'long_text',
        candidateInstructions: 'Describe your process for style adaptation',
        evaluationGuidelines: 'Assess versatility and client-focused approach',
        required: true,
        order: 2,
        characterLimit: 500
      }
    ],
    icon: 'PenTool'
  },
  {
    id: 'game-designer',
    name: 'Game Designer',
    description: 'Game concepts, mechanics design, and player experience',
    category: 'creative',
    estimatedTime: 45,
    questions: [
      {
        question: 'Share examples of games you\'ve designed or worked on',
        type: 'portfolio_link',
        candidateInstructions: 'Include playable games, prototypes, or design documents',
        evaluationGuidelines: 'Assess game design thinking, mechanics, and user experience',
        required: true,
        order: 1
      },
      {
        question: 'Design a simple mobile game concept',
        type: 'long_text',
        candidateInstructions: 'Include core mechanics, target audience, and monetization strategy',
        evaluationGuidelines: 'Look for creative thinking, market awareness, and feasibility',
        required: true,
        order: 2,
        characterLimit: 700
      }
    ],
    icon: 'Gamepad2'
  },

  // ADVERTISING CATEGORY - NEW
  {
    id: 'meta-ads-manager',
    name: 'Meta Ads Manager',
    description: 'Facebook & Instagram advertising expertise, campaign optimization',
    category: 'advertising',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share examples of Meta ad campaigns you\'ve managed',
        type: 'portfolio_link',
        candidateInstructions: 'Include campaign performance metrics and case studies',
        evaluationGuidelines: 'Look for ROI improvements, audience targeting expertise, and optimization skills',
        required: true,
        order: 1
      },
      {
        question: 'How do you approach audience targeting and lookalike creation on Meta platforms?',
        type: 'long_text',
        candidateInstructions: 'Describe your strategy for audience research and segmentation',
        evaluationGuidelines: 'Assess understanding of Meta\'s targeting capabilities and strategic thinking',
        required: true,
        order: 2,
        characterLimit: 600
      },
      {
        question: 'What metrics do you use to optimize Meta ad performance?',
        type: 'text',
        candidateInstructions: 'List key KPIs and explain your optimization process',
        evaluationGuidelines: 'Look for data-driven approach and understanding of performance metrics',
        required: true,
        order: 3
      }
    ],
    icon: 'Target'
  },
  {
    id: 'google-ads-specialist',
    name: 'Google Ads Specialist',
    description: 'Search, display, and YouTube advertising on Google platforms',
    category: 'advertising',
    estimatedTime: 35,
    questions: [
      {
        question: 'Describe a Google Ads campaign you optimized for better performance',
        type: 'long_text',
        candidateInstructions: 'Include initial challenges, optimization strategies, and results achieved',
        evaluationGuidelines: 'Assess problem-solving skills, Google Ads knowledge, and results focus',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'How do you approach keyword research and match type strategy?',
        type: 'text',
        candidateInstructions: 'Explain your process for keyword selection and bidding strategy',
        evaluationGuidelines: 'Look for understanding of search intent and bidding optimization',
        required: true,
        order: 2
      },
      {
        question: 'What Google Ads certifications do you hold?',
        type: 'text',
        candidateInstructions: 'List your current Google Ads certifications and expertise areas',
        evaluationGuidelines: 'Verify platform expertise and commitment to staying current',
        required: true,
        order: 3
      }
    ],
    icon: 'Search'
  },
  {
    id: 'ppc-manager',
    name: 'PPC Manager',
    description: 'Multi-platform paid advertising management and optimization',
    category: 'advertising',
    estimatedTime: 40,
    questions: [
      {
        question: 'How do you manage PPC campaigns across multiple platforms?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach to multi-platform campaign coordination',
        evaluationGuidelines: 'Look for strategic thinking and platform-specific optimization knowledge',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Share a portfolio of PPC campaigns with performance data',
        type: 'portfolio_link',
        candidateInstructions: 'Include campaigns from different platforms with ROI metrics',
        evaluationGuidelines: 'Assess campaign diversity, performance tracking, and results achievement',
        required: true,
        order: 2
      },
      {
        question: 'How do you handle budget allocation across different campaigns?',
        type: 'text',
        candidateInstructions: 'Explain your budget optimization and allocation strategy',
        evaluationGuidelines: 'Look for financial management skills and ROI-focused approach',
        required: true,
        order: 3
      }
    ],
    icon: 'TrendingUp'
  },
  {
    id: 'ad-creative-specialist',
    name: 'Ad Creative Specialist',
    description: 'Ad design, copy creation, and creative testing strategies',
    category: 'advertising',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your portfolio of ad creatives across different platforms',
        type: 'portfolio_link',
        candidateInstructions: 'Include static ads, video ads, and carousel formats with performance data',
        evaluationGuidelines: 'Assess creative quality, platform adaptation, and performance correlation',
        required: true,
        order: 1
      },
      {
        question: 'How do you approach A/B testing for ad creatives?',
        type: 'long_text',
        candidateInstructions: 'Describe your testing methodology and decision-making process',
        evaluationGuidelines: 'Look for systematic testing approach and data-driven creative decisions',
        required: true,
        order: 2,
        characterLimit: 600
      },
      {
        question: 'What tools do you use for ad creative production?',
        type: 'text',
        candidateInstructions: 'List design tools, video editing software, and automation platforms',
        evaluationGuidelines: 'Assess technical proficiency and workflow efficiency',
        required: true,
        order: 3
      }
    ],
    icon: 'Palette'
  },
  {
    id: 'media-buyer',
    name: 'Media Buyer',
    description: 'Programmatic advertising, media planning, and budget optimization',
    category: 'advertising',
    estimatedTime: 35,
    questions: [
      {
        question: 'Describe your experience with programmatic advertising platforms',
        type: 'long_text',
        candidateInstructions: 'Include DSPs used, targeting strategies, and optimization techniques',
        evaluationGuidelines: 'Assess programmatic knowledge and technical platform expertise',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How do you approach media planning and budget allocation?',
        type: 'text',
        candidateInstructions: 'Explain your process for channel selection and budget distribution',
        evaluationGuidelines: 'Look for strategic planning skills and ROI optimization focus',
        required: true,
        order: 2
      },
      {
        question: 'Share examples of media buying campaigns with performance metrics',
        type: 'portfolio_link',
        candidateInstructions: 'Include campaign strategies, channels used, and results achieved',
        evaluationGuidelines: 'Assess campaign performance and strategic media placement',
        required: true,
        order: 3
      }
    ],
    icon: 'BarChart3'
  },
  {
    id: 'campaign-manager',
    name: 'Campaign Manager',
    description: 'End-to-end campaign management, strategy, and performance analysis',
    category: 'advertising',
    estimatedTime: 40,
    questions: [
      {
        question: 'Walk through your process for launching a new advertising campaign',
        type: 'long_text',
        candidateInstructions: 'Include strategy development, execution steps, and optimization phases',
        evaluationGuidelines: 'Look for systematic approach and comprehensive campaign management skills',
        required: true,
        order: 1,
        characterLimit: 800
      },
      {
        question: 'How do you coordinate with creative, analytics, and client teams?',
        type: 'text',
        candidateInstructions: 'Describe your project management and communication approach',
        evaluationGuidelines: 'Assess collaboration skills and team coordination abilities',
        required: true,
        order: 2
      },
      {
        question: 'Share a case study of a challenging campaign you managed',
        type: 'portfolio_link',
        candidateInstructions: 'Include problems faced, solutions implemented, and results achieved',
        evaluationGuidelines: 'Evaluate problem-solving skills and campaign recovery abilities',
        required: true,
        order: 3
      }
    ],
    icon: 'ClipboardList'
  },
  {
    id: 'performance-marketing-manager',
    name: 'Performance Marketing Manager',
    description: 'Data-driven marketing, conversion optimization, and growth metrics',
    category: 'advertising',
    estimatedTime: 40,
    questions: [
      {
        question: 'How do you set up and optimize conversion tracking across platforms?',
        type: 'long_text',
        candidateInstructions: 'Include tracking setup, attribution models, and optimization strategies',
        evaluationGuidelines: 'Assess technical tracking knowledge and data-driven optimization skills',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'Describe your approach to customer acquisition cost (CAC) optimization',
        type: 'text',
        candidateInstructions: 'Explain strategies for reducing CAC while maintaining quality',
        evaluationGuidelines: 'Look for understanding of unit economics and growth efficiency',
        required: true,
        order: 2
      },
      {
        question: 'Share performance marketing campaigns with detailed metrics',
        type: 'portfolio_link',
        candidateInstructions: 'Include CAC, LTV, ROAS, and other performance indicators',
        evaluationGuidelines: 'Assess results-driven approach and metric optimization success',
        required: true,
        order: 3
      }
    ],
    icon: 'TrendingUp'
  },
  {
    id: 'advertising-analyst',
    name: 'Advertising Analyst',
    description: 'Campaign analysis, reporting, and performance insights',
    category: 'advertising',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you analyze and report on advertising campaign performance?',
        type: 'long_text',
        candidateInstructions: 'Describe your analysis framework and reporting methodology',
        evaluationGuidelines: 'Look for analytical thinking and clear communication of insights',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'What tools do you use for advertising analytics and reporting?',
        type: 'text',
        candidateInstructions: 'List analytics platforms, visualization tools, and automation software',
        evaluationGuidelines: 'Assess technical proficiency and tool expertise',
        required: true,
        order: 2
      },
      {
        question: 'Share examples of advertising reports or dashboards you\'ve created',
        type: 'portfolio_link',
        candidateInstructions: 'Include data visualizations and actionable insights',
        evaluationGuidelines: 'Evaluate reporting quality and insight generation ability',
        required: true,
        order: 3
      }
    ],
    icon: 'BarChart3'
  },
  {
    id: 'brand-advertising-manager',
    name: 'Brand Advertising Manager',
    description: 'Brand awareness campaigns, creative strategy, and brand positioning',
    category: 'advertising',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you develop brand advertising strategies that drive awareness?',
        type: 'long_text',
        candidateInstructions: 'Include audience research, creative strategy, and measurement approach',
        evaluationGuidelines: 'Look for strategic thinking and brand-focused campaign development',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'Share examples of brand campaigns you\'ve managed',
        type: 'portfolio_link',
        candidateInstructions: 'Include campaign objectives, creative execution, and brand impact metrics',
        evaluationGuidelines: 'Assess brand campaign quality and awareness impact',
        required: true,
        order: 2
      },
      {
        question: 'How do you measure brand advertising effectiveness?',
        type: 'text',
        candidateInstructions: 'Explain metrics and methodologies for brand campaign measurement',
        evaluationGuidelines: 'Look for understanding of brand metrics beyond direct response',
        required: true,
        order: 3
      }
    ],
    icon: 'Megaphone'
  },
  {
    id: 'affiliate-marketing-manager',
    name: 'Affiliate Marketing Manager',
    description: 'Affiliate program management, partnership development, and commission optimization',
    category: 'advertising',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you recruit and manage affiliate partners?',
        type: 'long_text',
        candidateInstructions: 'Describe your partner acquisition and relationship management strategy',
        evaluationGuidelines: 'Assess partnership development and management skills',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'What affiliate networks and tracking platforms have you used?',
        type: 'text',
        candidateInstructions: 'List platforms and explain your experience with each',
        evaluationGuidelines: 'Look for technical platform knowledge and tracking expertise',
        required: true,
        order: 2
      },
      {
        question: 'Share results from affiliate programs you\'ve managed',
        type: 'portfolio_link',
        candidateInstructions: 'Include program growth, top performer metrics, and ROI data',
        evaluationGuidelines: 'Evaluate program management success and performance optimization',
        required: true,
        order: 3
      }
    ],
    icon: 'Users'
  },

  // MARKETING CATEGORY
  {
    id: 'marketing',
    name: 'Marketing Specialist',
    description: 'Campaign examples, strategy questions, and content creation',
    category: 'marketing',
    estimatedTime: 30,
    questions: [
      {
        question: 'Describe a successful marketing campaign you\'ve worked on',
        type: 'long_text',
        candidateInstructions: 'Include the challenge, strategy, execution, and results',
        evaluationGuidelines: 'Look for strategic thinking, creativity, and measurable impact',
        required: true,
        order: 1,
        characterLimit: 800
      }
    ]
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing Manager',
    description: 'Multi-channel campaigns, analytics, and growth strategies',
    category: 'marketing',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you develop an integrated digital marketing strategy?',
        type: 'long_text',
        candidateInstructions: 'Include channel selection, budget allocation, and measurement',
        evaluationGuidelines: 'Assess strategic thinking and channel expertise',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'Share examples of digital campaigns you\'ve managed',
        type: 'portfolio_link',
        candidateInstructions: 'Include campaign results and performance metrics',
        evaluationGuidelines: 'Look for results-driven approach and analytical skills',
        required: true,
        order: 2
      }
    ],
    icon: 'Zap'
  },
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    description: 'Technical SEO, content optimization, and ranking strategies',
    category: 'marketing',
    estimatedTime: 35,
    questions: [
      {
        question: 'How would you conduct an SEO audit for a new website?',
        type: 'long_text',
        candidateInstructions: 'Detail your step-by-step audit process',
        evaluationGuidelines: 'Look for technical knowledge and systematic approach',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'What tools do you use for SEO analysis and why?',
        type: 'text',
        candidateInstructions: 'List your preferred SEO tools and their applications',
        evaluationGuidelines: 'Assess tool proficiency and practical knowledge',
        required: true,
        order: 2
      }
    ],
    icon: 'Search'
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing Manager',
    description: 'Campaign design, automation, and performance optimization',
    category: 'marketing',
    estimatedTime: 30,
    questions: [
      {
        question: 'Design an email automation sequence for new subscribers',
        type: 'long_text',
        candidateInstructions: 'Include email types, timing, and personalization strategy',
        evaluationGuidelines: 'Look for customer journey understanding and engagement tactics',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How do you improve email deliverability and engagement?',
        type: 'text',
        candidateInstructions: 'Share your optimization strategies and best practices',
        evaluationGuidelines: 'Assess technical knowledge and performance focus',
        required: true,
        order: 2
      }
    ],
    icon: 'Mail'
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    description: 'Content strategy, analytics interpretation, and campaign examples',
    category: 'marketing',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share examples of social media campaigns you\'ve managed',
        type: 'portfolio_link',
        candidateInstructions: 'Provide links to successful campaigns or content you\'ve created',
        evaluationGuidelines: 'Look for engagement rates, content quality, and strategic thinking',
        required: true,
        order: 1
      },
      {
        question: 'How would you handle a negative comment or review on social media?',
        type: 'text',
        candidateInstructions: 'Describe your crisis management approach',
        evaluationGuidelines: 'Assess communication skills and crisis management ability',
        required: true,
        order: 2
      },
      {
        question: 'Create a content calendar outline for a week',
        type: 'file_upload',
        candidateInstructions: 'Upload a document showing your content planning approach',
        evaluationGuidelines: 'Look for strategic thinking, consistency, and platform understanding',
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'growth-hacker',
    name: 'Growth Hacker',
    description: 'Rapid experimentation, data analysis, and scalable growth',
    category: 'marketing',
    estimatedTime: 40,
    questions: [
      {
        question: 'Describe a growth experiment you designed and executed',
        type: 'long_text',
        candidateInstructions: 'Include hypothesis, methodology, and results',
        evaluationGuidelines: 'Look for experimental mindset and data-driven approach',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'How do you identify and prioritize growth opportunities?',
        type: 'text',
        candidateInstructions: 'Explain your framework for growth opportunity assessment',
        evaluationGuidelines: 'Assess strategic thinking and prioritization skills',
        required: true,
        order: 2
      }
    ],
    icon: 'TrendingUp'
  },

  // SALES CATEGORY
  {
    id: 'sales',
    name: 'Sales Representative',
    description: 'Role-play scenarios, video pitch, and experience questions',
    category: 'sales',
    estimatedTime: 25,
    questions: [
      {
        question: 'Record a 2-minute sales pitch for our product',
        type: 'video_upload',
        candidateInstructions: 'Imagine you\'re presenting to a potential client',
        evaluationGuidelines: 'Assess communication skills, persuasiveness, and product understanding',
        required: true,
        order: 1,
        timeLimit: 2
      }
    ]
  },
  {
    id: 'account-manager',
    name: 'Account Manager',
    description: 'Relationship building, account growth, and retention strategies',
    category: 'sales',
    estimatedTime: 30,
    questions: [
      {
        question: 'How do you identify expansion opportunities within existing accounts?',
        type: 'long_text',
        candidateInstructions: 'Describe your process for account analysis and growth planning',
        evaluationGuidelines: 'Look for strategic thinking and relationship management skills',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Describe how you would handle a client considering cancellation',
        type: 'text',
        candidateInstructions: 'Walk through your retention strategy',
        evaluationGuidelines: 'Assess problem-solving and communication skills',
        required: true,
        order: 2
      }
    ],
    icon: 'Briefcase'
  },
  {
    id: 'business-development',
    name: 'Business Development Rep',
    description: 'Lead generation, prospecting, and outbound strategies',
    category: 'sales',
    estimatedTime: 30,
    questions: [
      {
        question: 'How do you research and qualify prospects?',
        type: 'text',
        candidateInstructions: 'Describe your prospecting methodology',
        evaluationGuidelines: 'Look for systematic approach and research skills',
        required: true,
        order: 1
      },
      {
        question: 'Write a cold email to a potential enterprise client',
        type: 'text',
        candidateInstructions: 'Create a compelling outreach message',
        evaluationGuidelines: 'Assess communication skills and value proposition clarity',
        required: true,
        order: 2
      }
    ],
    icon: 'UserPlus'
  },
  {
    id: 'sales-manager',
    name: 'Sales Manager',
    description: 'Team leadership, pipeline management, and sales strategy',
    category: 'sales',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you coach underperforming sales team members?',
        type: 'long_text',
        candidateInstructions: 'Describe your coaching and development approach',
        evaluationGuidelines: 'Look for leadership skills and performance management experience',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How do you forecast sales and manage pipeline accuracy?',
        type: 'text',
        candidateInstructions: 'Explain your forecasting methodology',
        evaluationGuidelines: 'Assess analytical skills and sales process understanding',
        required: true,
        order: 2
      }
    ],
    icon: 'Target'
  },

  // CONTENT CATEGORY
  {
    id: 'copywriter',
    name: 'Copywriter',
    description: 'Writing samples, brand voice adaptation, and SEO knowledge',
    category: 'content',
    estimatedTime: 40,
    questions: [
      {
        question: 'Share your portfolio of copywriting work',
        type: 'portfolio_link',
        candidateInstructions: 'Include various types of copy (web, email, ads, etc.)',
        evaluationGuidelines: 'Assess writing quality, versatility, and conversion-focused approach',
        required: true,
        order: 1
      },
      {
        question: 'Write a compelling product description for a premium coffee brand',
        type: 'text',
        candidateInstructions: 'Create copy that appeals to quality-conscious coffee lovers',
        evaluationGuidelines: 'Look for persuasive writing, brand voice consistency, and audience understanding',
        required: true,
        order: 2
      },
      {
        question: 'How do you optimize copy for SEO while maintaining readability?',
        type: 'long_text',
        candidateInstructions: 'Explain your approach to balancing SEO and user experience',
        evaluationGuidelines: 'Test SEO knowledge and understanding of user-first content',
        required: true,
        order: 3,
        characterLimit: 500
      }
    ]
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Content portfolio, audience engagement strategies, and creative process',
    category: 'content',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your content creation portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Include your best content across different platforms',
        evaluationGuidelines: 'Assess creativity, consistency, and audience engagement',
        required: true,
        order: 1
      },
      {
        question: 'How do you research and plan content for different audiences?',
        type: 'long_text',
        candidateInstructions: 'Describe your content strategy and research process',
        evaluationGuidelines: 'Look for strategic thinking and audience understanding',
        required: true,
        order: 2,
        characterLimit: 600
      },
      {
        question: 'Create a content idea for a tech startup\'s LinkedIn page',
        type: 'text',
        candidateInstructions: 'Provide the concept, format, and why it would engage the audience',
        evaluationGuidelines: 'Assess creativity, platform knowledge, and business understanding',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    description: 'Documentation samples, complex topic simplification, and user focus',
    category: 'content',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share examples of technical documentation you\'ve created',
        type: 'portfolio_link',
        candidateInstructions: 'Include user guides, API docs, or help articles',
        evaluationGuidelines: 'Look for clarity, structure, and user-centered approach',
        required: true,
        order: 1
      },
      {
        question: 'How do you make complex technical concepts accessible to non-technical users?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach and provide examples',
        evaluationGuidelines: 'Assess communication skills and empathy for different audiences',
        required: true,
        order: 2,
        characterLimit: 600
      }
    ],
    icon: 'FileText'
  },
  {
    id: 'podcast-producer',
    name: 'Podcast Producer',
    description: 'Production experience, content strategy, and audience growth',
    category: 'content',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share examples of podcasts you\'ve produced',
        type: 'portfolio_link',
        candidateInstructions: 'Include links to episodes and show analytics if available',
        evaluationGuidelines: 'Assess production quality, content strategy, and audience engagement',
        required: true,
        order: 1
      },
      {
        question: 'How do you plan and structure podcast content?',
        type: 'text',
        candidateInstructions: 'Describe your content planning and production workflow',
        evaluationGuidelines: 'Look for systematic approach and content strategy understanding',
        required: true,
        order: 2
      }
    ],
    icon: 'Mic'
  },

  // ADMINISTRATIVE CATEGORY
  {
    id: 'executive-assistant',
    name: 'Executive Assistant / Virtual Assistant',
    description: 'Organization skills, communication samples, and time management',
    category: 'administrative',
    estimatedTime: 30,
    questions: [
      {
        question: 'How would you prioritize and manage multiple urgent tasks for different executives?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach with a specific scenario',
        evaluationGuidelines: 'Assess organizational skills, prioritization ability, and problem-solving',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Draft a professional email declining a meeting request',
        type: 'text',
        candidateInstructions: 'Write a polite but firm email suggesting alternative times',
        evaluationGuidelines: 'Look for professional tone, clarity, and diplomatic communication',
        required: true,
        order: 2
      },
      {
        question: 'What tools do you use for calendar management and task tracking?',
        type: 'text',
        candidateInstructions: 'List your preferred tools and explain why you chose them',
        evaluationGuidelines: 'Evaluate technical proficiency and tool selection reasoning',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'office-manager',
    name: 'Office Manager',
    description: 'Operations management, vendor relations, and workplace coordination',
    category: 'administrative',
    estimatedTime: 30,
    questions: [
      {
        question: 'How do you manage office operations and maintain a productive workplace?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach to office management',
        evaluationGuidelines: 'Look for organizational skills and workplace understanding',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How would you handle a conflict between team members in the office?',
        type: 'text',
        candidateInstructions: 'Describe your conflict resolution approach',
        evaluationGuidelines: 'Assess diplomatic skills and problem-solving ability',
        required: true,
        order: 2
      }
    ],
    icon: 'Building'
  },
  {
    id: 'data-entry',
    name: 'Data Entry Specialist',
    description: 'Accuracy assessment, speed evaluation, and attention to detail',
    category: 'administrative',
    estimatedTime: 25,
    questions: [
      {
        question: 'How do you ensure accuracy while maintaining speed in data entry?',
        type: 'text',
        candidateInstructions: 'Describe your quality control methods',
        evaluationGuidelines: 'Look for systematic approach and attention to detail',
        required: true,
        order: 1
      },
      {
        question: 'What data entry software and tools are you proficient in?',
        type: 'text',
        candidateInstructions: 'List your experience with different platforms',
        evaluationGuidelines: 'Assess technical proficiency and tool knowledge',
        required: true,
        order: 2
      }
    ],
    icon: 'Database'
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    description: 'Communication skills, multitasking ability, and customer service',
    category: 'administrative',
    estimatedTime: 25,
    questions: [
      {
        question: 'How would you handle multiple phone calls while greeting visitors?',
        type: 'text',
        candidateInstructions: 'Describe your multitasking approach',
        evaluationGuidelines: 'Look for organizational skills and customer service focus',
        required: true,
        order: 1
      },
      {
        question: 'Record a professional phone greeting',
        type: 'video_upload',
        candidateInstructions: 'Show how you would answer the phone for a business',
        evaluationGuidelines: 'Assess communication clarity and professional demeanor',
        required: true,
        order: 2,
        timeLimit: 1
      }
    ],
    icon: 'Phone'
  },

  // MANAGEMENT CATEGORY
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Planning scenarios, stakeholder communication, and methodology knowledge',
    category: 'management',
    estimatedTime: 35,
    questions: [
      {
        question: 'Describe how you would handle a project that\'s falling behind schedule',
        type: 'long_text',
        candidateInstructions: 'Walk through your problem-solving and communication approach',
        evaluationGuidelines: 'Look for leadership skills, problem-solving, and stakeholder management',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'What project management methodologies are you familiar with?',
        type: 'text',
        candidateInstructions: 'Explain which ones you prefer and why',
        evaluationGuidelines: 'Assess methodology knowledge and practical application',
        required: true,
        order: 2
      },
      {
        question: 'How do you manage conflicting priorities from different stakeholders?',
        type: 'text',
        candidateInstructions: 'Provide a specific example if possible',
        evaluationGuidelines: 'Evaluate diplomatic skills and conflict resolution ability',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Product strategy, roadmap planning, and stakeholder alignment',
    category: 'management',
    estimatedTime: 40,
    questions: [
      {
        question: 'How do you prioritize product features and create a roadmap?',
        type: 'long_text',
        candidateInstructions: 'Describe your framework for product prioritization',
        evaluationGuidelines: 'Look for strategic thinking and data-driven decision making',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'Share an example of a product you\'ve managed from concept to launch',
        type: 'portfolio_link',
        candidateInstructions: 'Include metrics and outcomes if possible',
        evaluationGuidelines: 'Assess end-to-end product management experience',
        required: true,
        order: 2
      }
    ],
    icon: 'Target'
  },
  {
    id: 'team-lead',
    name: 'Team Lead',
    description: 'Leadership experience, team development, and performance management',
    category: 'management',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you motivate and develop team members?',
        type: 'long_text',
        candidateInstructions: 'Describe your leadership and coaching approach',
        evaluationGuidelines: 'Look for leadership skills and people development experience',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How do you handle performance issues within your team?',
        type: 'text',
        candidateInstructions: 'Describe your approach to performance management',
        evaluationGuidelines: 'Assess management skills and problem-solving ability',
        required: true,
        order: 2
      }
    ],
    icon: 'Users'
  },
  {
    id: 'operations-manager',
    name: 'Operations Manager',
    description: 'Process optimization, efficiency improvement, and system management',
    category: 'management',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you identify and improve operational inefficiencies?',
        type: 'long_text',
        candidateInstructions: 'Describe your process improvement methodology',
        evaluationGuidelines: 'Look for analytical thinking and systematic approach',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Share an example of an operational improvement you implemented',
        type: 'text',
        candidateInstructions: 'Include the problem, solution, and results',
        evaluationGuidelines: 'Assess practical experience and results focus',
        required: true,
        order: 2
      }
    ],
    icon: 'ClipboardList'
  },

  // SUPPORT CATEGORY
  {
    id: 'customer-support',
    name: 'Customer Support Specialist',
    description: 'Problem-solving scenarios, communication skills, and empathy assessment',
    category: 'support',
    estimatedTime: 25,
    questions: [
      {
        question: 'How would you handle an angry customer who received a defective product?',
        type: 'text',
        candidateInstructions: 'Describe your step-by-step approach to resolution',
        evaluationGuidelines: 'Look for empathy, problem-solving skills, and de-escalation techniques',
        required: true,
        order: 1
      },
      {
        question: 'Record a sample support call response',
        type: 'video_upload',
        candidateInstructions: 'Role-play helping a customer with a billing issue (2-3 minutes)',
        evaluationGuidelines: 'Assess communication clarity, patience, and problem-solving approach',
        required: true,
        order: 2,
        timeLimit: 3
      },
      {
        question: 'What tools have you used for customer support and ticketing?',
        type: 'text',
        candidateInstructions: 'List your experience with support platforms and tools',
        evaluationGuidelines: 'Evaluate technical proficiency and platform familiarity',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'technical-support',
    name: 'Technical Support Engineer',
    description: 'Technical troubleshooting, documentation, and customer education',
    category: 'support',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you diagnose and resolve complex technical issues?',
        type: 'long_text',
        candidateInstructions: 'Describe your troubleshooting methodology',
        evaluationGuidelines: 'Look for systematic approach and technical problem-solving',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How do you explain technical concepts to non-technical users?',
        type: 'text',
        candidateInstructions: 'Provide an example of simplifying a complex issue',
        evaluationGuidelines: 'Assess communication skills and empathy',
        required: true,
        order: 2
      }
    ],
    icon: 'HeadphonesIcon'
  },
  {
    id: 'community-manager',
    name: 'Community Manager',
    description: 'Community building, engagement strategies, and content moderation',
    category: 'support',
    estimatedTime: 30,
    questions: [
      {
        question: 'How do you build and nurture an online community?',
        type: 'long_text',
        candidateInstructions: 'Describe your community building strategy',
        evaluationGuidelines: 'Look for engagement strategies and community understanding',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How would you handle negative or toxic behavior in a community?',
        type: 'text',
        candidateInstructions: 'Describe your moderation approach',
        evaluationGuidelines: 'Assess conflict resolution and community management skills',
        required: true,
        order: 2
      }
    ],
    icon: 'MessageCircle'
  },

  // ANALYTICAL CATEGORY
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Data interpretation, visualization examples, and analytical thinking',
    category: 'analytical',
    estimatedTime: 40,
    questions: [
      {
        question: 'Share examples of data visualizations or reports you\'ve created',
        type: 'portfolio_link',
        candidateInstructions: 'Include dashboards, charts, or analytical reports',
        evaluationGuidelines: 'Look for clear data storytelling and visualization best practices',
        required: true,
        order: 1
      },
      {
        question: 'Explain how you would analyze customer churn for a SaaS company',
        type: 'long_text',
        candidateInstructions: 'Describe your analytical approach and key metrics',
        evaluationGuidelines: 'Assess analytical thinking and business metric understanding',
        required: true,
        order: 2,
        characterLimit: 700
      },
      {
        question: 'What data analysis tools are you proficient in?',
        type: 'text',
        candidateInstructions: 'List tools and your experience level with each',
        evaluationGuidelines: 'Evaluate technical skills and tool proficiency',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    description: 'Requirements gathering, process analysis, and stakeholder management',
    category: 'analytical',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you gather and document business requirements?',
        type: 'long_text',
        candidateInstructions: 'Describe your requirements gathering process',
        evaluationGuidelines: 'Look for systematic approach and stakeholder management skills',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Share an example of a business process you analyzed and improved',
        type: 'text',
        candidateInstructions: 'Include the analysis method and outcomes',
        evaluationGuidelines: 'Assess analytical thinking and business impact',
        required: true,
        order: 2
      }
    ],
    icon: 'BarChart3'
  },
  {
    id: 'market-research',
    name: 'Market Research Analyst',
    description: 'Research methodology, data interpretation, and market insights',
    category: 'analytical',
    estimatedTime: 35,
    questions: [
      {
        question: 'How would you design a market research study for a new product launch?',
        type: 'long_text',
        candidateInstructions: 'Include methodology, sample size, and data collection methods',
        evaluationGuidelines: 'Look for research design skills and methodological knowledge',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'What tools do you use for market research and analysis?',
        type: 'text',
        candidateInstructions: 'List your preferred research tools and survey platforms',
        evaluationGuidelines: 'Assess tool proficiency and research experience',
        required: true,
        order: 2
      }
    ],
    icon: 'LineChart'
  },

  // HR CATEGORY
  {
    id: 'hr-specialist',
    name: 'HR Specialist',
    description: 'Scenario-based questions, policy knowledge, and people management',
    category: 'hr',
    estimatedTime: 30,
    questions: [
      {
        question: 'How would you handle a conflict between two team members?',
        type: 'long_text',
        candidateInstructions: 'Describe your mediation approach and steps you\'d take',
        evaluationGuidelines: 'Look for conflict resolution skills and people management ability',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Describe your experience with HR policies and compliance',
        type: 'text',
        candidateInstructions: 'Include specific areas like employment law, benefits, or safety',
        evaluationGuidelines: 'Assess policy knowledge and compliance understanding',
        required: true,
        order: 2
      },
      {
        question: 'How do you ensure fair and unbiased hiring practices?',
        type: 'text',
        candidateInstructions: 'Explain your approach to diverse and inclusive recruitment',
        evaluationGuidelines: 'Evaluate understanding of diversity, equity, and inclusion principles',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    description: 'Sourcing strategies, candidate assessment, and pipeline management',
    category: 'hr',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you source and attract passive candidates?',
        type: 'long_text',
        candidateInstructions: 'Describe your sourcing strategies and outreach methods',
        evaluationGuidelines: 'Look for creative sourcing and relationship building skills',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'How do you assess cultural fit during the interview process?',
        type: 'text',
        candidateInstructions: 'Explain your approach to evaluating cultural alignment',
        evaluationGuidelines: 'Assess interviewing skills and cultural awareness',
        required: true,
        order: 2
      }
    ],
    icon: 'UserPlus'
  },
  {
    id: 'hr-generalist',
    name: 'HR Generalist',
    description: 'Broad HR knowledge, employee relations, and program management',
    category: 'hr',
    estimatedTime: 35,
    questions: [
      {
        question: 'How do you handle employee performance improvement plans?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach to performance management',
        evaluationGuidelines: 'Look for fair and supportive performance management practices',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'What HR systems and tools are you experienced with?',
        type: 'text',
        candidateInstructions: 'List your experience with HRIS, ATS, and other HR platforms',
        evaluationGuidelines: 'Assess technical proficiency and system knowledge',
        required: true,
        order: 2
      }
    ],
    icon: 'Users'
  },

  // FINANCE CATEGORY
  {
    id: 'accountant',
    name: 'Accountant/Bookkeeper',
    description: 'Financial scenario analysis, attention to detail, and software proficiency',
    category: 'finance',
    estimatedTime: 35,
    questions: [
      {
        question: 'Explain how you would reconcile a bank statement with discrepancies',
        type: 'long_text',
        candidateInstructions: 'Walk through your step-by-step process for finding and resolving differences',
        evaluationGuidelines: 'Look for systematic approach, attention to detail, and problem-solving skills',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'What accounting software are you proficient in?',
        type: 'text',
        candidateInstructions: 'List your experience with different accounting platforms',
        evaluationGuidelines: 'Assess technical proficiency and software knowledge',
        required: true,
        order: 2
      },
      {
        question: 'How do you ensure accuracy in financial reporting?',
        type: 'text',
        candidateInstructions: 'Describe your quality control and review processes',
        evaluationGuidelines: 'Evaluate attention to detail and quality assurance practices',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    description: 'Financial modeling, analysis, and forecasting',
    category: 'finance',
    estimatedTime: 40,
    questions: [
      {
        question: 'How do you build and validate financial models?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach to financial modeling and validation',
        evaluationGuidelines: 'Look for analytical skills and attention to detail',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'Share an example of a financial analysis you\'ve conducted',
        type: 'text',
        candidateInstructions: 'Include the purpose, methodology, and key insights',
        evaluationGuidelines: 'Assess analytical thinking and business impact',
        required: true,
        order: 2
      }
    ],
    icon: 'LineChart'
  },
  {
    id: 'financial-controller',
    name: 'Financial Controller',
    description: 'Financial oversight, compliance, and team management',
    category: 'finance',
    estimatedTime: 40,
    questions: [
      {
        question: 'How do you ensure financial compliance and internal controls?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach to compliance and risk management',
        evaluationGuidelines: 'Look for regulatory knowledge and systematic approach',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'How do you manage month-end and year-end closing processes?',
        type: 'text',
        candidateInstructions: 'Describe your process management and timeline coordination',
        evaluationGuidelines: 'Assess organizational skills and process management',
        required: true,
        order: 2
      }
    ],
    icon: 'DollarSign'
  }
];

const getIcon = (iconName: string) => {
  const icons = {
    Plus: Plus,
    Code: Code,
    Palette: Palette,
    Megaphone: Megaphone,
    UserCheck: UserCheck,
    FileText: FileText,
    Video: Video,
    Sparkles: Sparkles,
    PenTool: PenTool,
    Calendar: Calendar,
    MessageCircle: MessageCircle,
    Edit3: Edit3,
    ClipboardList: ClipboardList,
    Users: Users,
    TrendingUp: TrendingUp,
    BarChart3: BarChart3,
    Calculator: Calculator,
    Smartphone: Smartphone,
    Server: Server,
    Shield: Shield,
    Database: Database,
    Monitor: Monitor,
    Camera: Camera,
    Brush: Brush,
    Gamepad2: Gamepad2,
    Search: Search,
    Mail: Mail,
    Globe: Globe,
    Zap: Zap,
    Mic: Mic,
    Phone: Phone,
    Building: Building,
    Target: Target,
    HeadphonesIcon: HeadphonesIcon,
    LineChart: LineChart,
    DollarSign: DollarSign,
    Briefcase: Briefcase,
    UserPlus: UserPlus
  };
  return icons[iconName as keyof typeof icons] || FileText;
};

export const SkillsTestTemplateSelector = ({ 
  onSelectTemplate, 
  onBack 
}: SkillsTestTemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'custom', name: 'Custom' },
    { id: 'developer', name: 'Developer' },
    { id: 'designer', name: 'Designer' },
    { id: 'creative', name: 'Creative' },
    { id: 'advertising', name: 'Advertising' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'content', name: 'Content' },
    { id: 'administrative', name: 'Administrative' },
    { id: 'management', name: 'Management' },
    { id: 'support', name: 'Support' },
    { id: 'analytical', name: 'Analytical' },
    { id: 'hr', name: 'HR' },
    { id: 'finance', name: 'Finance' },
    { id: 'sales', name: 'Sales' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-1 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-lg">Choose a Template</CardTitle>
        </div>
        
        {/* Compact Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap
                ${selectedCategory === category.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const IconComponent = getIcon(template.icon || 'FileText');
            
            return (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{template.name}</h4>
                        {template.estimatedTime > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {template.estimatedTime}m
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {template.description}
                      </p>
                      {template.questions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {template.questions.length} question{template.questions.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
