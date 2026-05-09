import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const recruiterEmail = "recruiter@syncup.dev";
const recruiterPassword = "Password@123";

const jobs = [
  {
    id: "seed-frontend-react-developer",
    title: "Frontend React Developer",
    companyName: "NovaTech Solutions",
    location: "Bengaluru, India",
    employmentType: "Full-time",
    salaryMin: 800000,
    salaryMax: 1400000,
    isRemote: false,
    description:
      "Build responsive dashboards and candidate-facing workflows using React, TypeScript, Redux Toolkit, REST APIs, and modern component patterns. Work closely with backend engineers to ship polished product features.",
    requirements:
      "React, TypeScript, JavaScript, Redux Toolkit, HTML, CSS, REST APIs, responsive design, Git, performance optimization.",
  },
  {
    id: "seed-backend-node-developer",
    title: "Backend Node.js Developer",
    companyName: "CloudMint Labs",
    location: "Hyderabad, India",
    employmentType: "Full-time",
    salaryMin: 900000,
    salaryMax: 1600000,
    isRemote: false,
    description:
      "Design scalable APIs for job search, authentication, application tracking, and notifications. Own database models, service layers, API security, and production reliability.",
    requirements:
      "Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, Redis, REST APIs, database indexing, error handling, API design.",
  },
  {
    id: "seed-full-stack-engineer",
    title: "Full Stack Engineer",
    companyName: "HireBridge AI",
    location: "Remote",
    employmentType: "Full-time",
    salaryMin: 1200000,
    salaryMax: 2200000,
    isRemote: true,
    description:
      "Create end-to-end hiring platform features across Next.js, Express, PostgreSQL, WebSockets, file uploads, and AI-based matching workflows.",
    requirements:
      "Next.js, React, Node.js, Express, PostgreSQL, Prisma, WebSockets, JWT, Redis, cloud storage, TypeScript.",
  },
  {
    id: "seed-ai-integration-engineer",
    title: "AI Integration Engineer",
    companyName: "SignalWorks",
    location: "Pune, India",
    employmentType: "Full-time",
    salaryMin: 1400000,
    salaryMax: 2600000,
    isRemote: false,
    description:
      "Integrate LLM APIs into resume parsing, job matching, scoring, and recommendation pipelines. Build robust prompt handling and JSON validation.",
    requirements:
      "Groq, OpenAI APIs, prompt engineering, TypeScript, Node.js, JSON schema validation, resume parsing, embeddings, PostgreSQL.",
  },
  {
    id: "seed-devops-engineer",
    title: "DevOps Engineer",
    companyName: "StackRail Systems",
    location: "Noida, India",
    employmentType: "Full-time",
    salaryMin: 1100000,
    salaryMax: 2100000,
    isRemote: false,
    description:
      "Maintain CI/CD pipelines, application deployments, observability, secrets management, and infrastructure automation for a fast-moving product team.",
    requirements:
      "Docker, GitHub Actions, Linux, AWS, Render, Vercel, PostgreSQL, Redis, monitoring, CI/CD, shell scripting.",
  },
  {
    id: "seed-nextjs-developer",
    title: "Next.js Developer",
    companyName: "PixelForge Studio",
    location: "Remote",
    employmentType: "Contract",
    salaryMin: 700000,
    salaryMax: 1300000,
    isRemote: true,
    description:
      "Build server-rendered product pages, authenticated app routes, reusable UI components, and API integrations for a SaaS hiring dashboard.",
    requirements:
      "Next.js, React, TypeScript, Tailwind CSS, server components, API integration, authentication, accessibility.",
  },
  {
    id: "seed-data-analyst",
    title: "Data Analyst",
    companyName: "MetricNest",
    location: "Mumbai, India",
    employmentType: "Full-time",
    salaryMin: 600000,
    salaryMax: 1100000,
    isRemote: false,
    description:
      "Analyze hiring funnel metrics, candidate conversion, recruiter performance, and job market trends. Build dashboards and communicate insights to stakeholders.",
    requirements:
      "SQL, Python, Excel, Power BI, Tableau, data visualization, statistics, funnel analysis, stakeholder communication.",
  },
  {
    id: "seed-qa-automation-engineer",
    title: "QA Automation Engineer",
    companyName: "TestPilot Technologies",
    location: "Chennai, India",
    employmentType: "Full-time",
    salaryMin: 750000,
    salaryMax: 1300000,
    isRemote: false,
    description:
      "Create automated test suites for web applications, APIs, authentication flows, file uploads, and real-time notification features.",
    requirements:
      "Playwright, Cypress, Jest, API testing, TypeScript, test planning, CI/CD, bug reporting, regression testing.",
  },
  {
    id: "seed-product-manager",
    title: "Product Manager - Hiring Platform",
    companyName: "TalentLoop",
    location: "Gurugram, India",
    employmentType: "Full-time",
    salaryMin: 1500000,
    salaryMax: 2800000,
    isRemote: false,
    description:
      "Own roadmap, user stories, recruiter workflows, candidate experience, and metrics for a job matching platform with AI-assisted screening.",
    requirements:
      "Product strategy, agile, user research, analytics, roadmap planning, wireframes, stakeholder management, hiring domain knowledge.",
  },
  {
    id: "seed-ui-ux-designer",
    title: "UI/UX Designer",
    companyName: "Crafted Interfaces",
    location: "Remote",
    employmentType: "Full-time",
    salaryMin: 800000,
    salaryMax: 1500000,
    isRemote: true,
    description:
      "Design intuitive job search, resume upload, application tracking, recruiter dashboards, and notification experiences for web and mobile users.",
    requirements:
      "Figma, design systems, UX research, prototyping, responsive design, accessibility, user flows, product thinking.",
  },
  {
    id: "seed-mobile-react-native-developer",
    title: "React Native Developer",
    companyName: "AppSprint",
    location: "Ahmedabad, India",
    employmentType: "Full-time",
    salaryMin: 850000,
    salaryMax: 1600000,
    isRemote: false,
    description:
      "Develop mobile screens for job discovery, profile management, resume uploads, push notifications, and application tracking.",
    requirements:
      "React Native, TypeScript, Redux, REST APIs, mobile navigation, file uploads, performance tuning, Android, iOS.",
  },
  {
    id: "seed-java-spring-boot-developer",
    title: "Java Spring Boot Developer",
    companyName: "EnterpriseGrid",
    location: "Bengaluru, India",
    employmentType: "Full-time",
    salaryMin: 1000000,
    salaryMax: 1900000,
    isRemote: false,
    description:
      "Build enterprise backend services, authentication modules, database integrations, and high-volume APIs for business applications.",
    requirements:
      "Java, Spring Boot, REST APIs, PostgreSQL, Hibernate, microservices, Docker, unit testing, system design.",
  },
  {
    id: "seed-python-django-developer",
    title: "Python Django Developer",
    companyName: "CodeHarbor",
    location: "Remote",
    employmentType: "Full-time",
    salaryMin: 900000,
    salaryMax: 1700000,
    isRemote: true,
    description:
      "Develop backend services for user profiles, job recommendations, resume data processing, and admin workflows using Python and Django.",
    requirements:
      "Python, Django, Django REST Framework, PostgreSQL, Celery, Redis, API design, testing, Git.",
  },
  {
    id: "seed-cloud-engineer",
    title: "Cloud Engineer",
    companyName: "InfraWave",
    location: "Pune, India",
    employmentType: "Full-time",
    salaryMin: 1200000,
    salaryMax: 2300000,
    isRemote: false,
    description:
      "Design cloud deployment patterns, storage integrations, managed databases, queues, caching, and environment configuration for scalable applications.",
    requirements:
      "AWS, Azure, GCP, Docker, Kubernetes, Terraform, PostgreSQL, Redis, object storage, monitoring, security.",
  },
  {
    id: "seed-security-engineer",
    title: "Application Security Engineer",
    companyName: "SecurePath",
    location: "Remote",
    employmentType: "Full-time",
    salaryMin: 1600000,
    salaryMax: 3000000,
    isRemote: true,
    description:
      "Review authentication, authorization, API security, file upload safety, dependency security, and secure deployment practices across web services.",
    requirements:
      "OWASP, JWT security, API security, threat modeling, secure coding, Node.js, cloud security, vulnerability assessment.",
  },
  {
    id: "seed-technical-support-engineer",
    title: "Technical Support Engineer",
    companyName: "SupportStack",
    location: "Indore, India",
    employmentType: "Full-time",
    salaryMin: 450000,
    salaryMax: 850000,
    isRemote: false,
    description:
      "Support customers using a SaaS platform, troubleshoot API issues, investigate logs, document solutions, and coordinate fixes with engineering.",
    requirements:
      "SQL basics, REST APIs, troubleshooting, logs, customer communication, JavaScript basics, documentation, ticketing systems.",
  },
  {
    id: "seed-business-analyst",
    title: "Business Analyst",
    companyName: "ProcessIQ",
    location: "Hyderabad, India",
    employmentType: "Full-time",
    salaryMin: 700000,
    salaryMax: 1300000,
    isRemote: false,
    description:
      "Gather requirements, write user stories, map workflows, analyze hiring operations, and coordinate delivery between product, design, and engineering.",
    requirements:
      "Requirement gathering, user stories, SQL basics, agile, documentation, process mapping, stakeholder communication, analytics.",
  },
  {
    id: "seed-machine-learning-engineer",
    title: "Machine Learning Engineer",
    companyName: "VectorMind",
    location: "Bengaluru, India",
    employmentType: "Full-time",
    salaryMin: 1800000,
    salaryMax: 3500000,
    isRemote: false,
    description:
      "Build ML-backed ranking, recommendation, and semantic matching systems for jobs and resumes. Collaborate with backend engineers to ship models into production.",
    requirements:
      "Python, machine learning, NLP, embeddings, ranking models, PyTorch, scikit-learn, PostgreSQL, model evaluation.",
  },
  {
    id: "seed-database-administrator",
    title: "PostgreSQL Database Administrator",
    companyName: "DataRoot",
    location: "Remote",
    employmentType: "Part-time",
    salaryMin: 600000,
    salaryMax: 1200000,
    isRemote: true,
    description:
      "Optimize PostgreSQL schemas, indexes, query plans, backup strategies, migrations, and database reliability for production systems.",
    requirements:
      "PostgreSQL, query optimization, indexing, backups, migrations, monitoring, Prisma, SQL, performance tuning.",
  },
  {
    id: "seed-system-design-engineer",
    title: "System Design Engineer",
    companyName: "ScaleCraft",
    location: "Delhi, India",
    employmentType: "Full-time",
    salaryMin: 1700000,
    salaryMax: 3200000,
    isRemote: false,
    description:
      "Design scalable backend architecture for search, caching, notifications, upload pipelines, matching services, and application workflows.",
    requirements:
      "System design, Node.js, distributed systems, Redis, PostgreSQL, message queues, WebSockets, API gateways, scalability.",
  },
];

const main = async () => {
  const recruiter = await prisma.user.upsert({
    where: { email: recruiterEmail },
    update: {
      name: "Syncup Recruiter",
      role: "RECRUITER",
    },
    create: {
      email: recruiterEmail,
      name: "Syncup Recruiter",
      password: await bcrypt.hash(recruiterPassword, 10),
      role: "RECRUITER",
    },
  });

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {
        ...job,
        postedById: recruiter.id,
        isActive: true,
      },
      create: {
        ...job,
        postedById: recruiter.id,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${jobs.length} jobs.`);
  console.log(`Recruiter login: ${recruiterEmail} / ${recruiterPassword}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
