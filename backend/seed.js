const mongoose = require("mongoose");
require("dotenv").config();

const Internship = require("./models/Internship");
const Hackathon = require("./models/Hackathon");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected for seeding");

    // Clear old data (optional but clean)
    await Internship.deleteMany();
    await Hackathon.deleteMany();

    const statusMap = {
      "closing-soon": "Closing Soon",
      "Closing-Soon": "Closing Soon",
      "closing soon": "Closing Soon",
      "Upcoming": "Upcoming",
      "Open": "Open",
      "Closed": "Closed"
    };

    const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11
    };

    const addSeedDefaults = (item) => {
      const normalizedStatus = statusMap[item.status] || item.status;
      const monthNumber = monthMap[item.month] ?? 0;
      const deadline = item.deadline
        ? new Date(item.deadline)
        : new Date(2026, monthNumber, 20, 0, 0, 0, 0);

      return {
        ...item,
        status: normalizedStatus,
        deadline
      };
    };

    // Insert internships
    const internshipSeed = [
      {
    month: "January",
    company: "Uber",
    role: "Software Engineer Intern",
    name:"HackTag",
    type: "Hackathon",
    eligibility:"3rd year",
    status: "Closing-Soon",
    logo: "assets/logos/uber.png",
    applyLink: "https://www.uber.com/careers/"
  },
  {
    month: "January",
    company: "Uber",
    role: "Software Engineer Intern",
    name:"She++",
    type: "Internship",
    eligibility:"female",
    status: "Closed",
    logo: "assets/logos/uber.png",
    applyLink: "https://flows.beamery.com/uber/apac-uber-she-2026-tjfslqitq"
  },
  {
    month: "January",
    company: "American Express",
    role: "Software Engineer Intern",
    name:"CodeStreet",
    type: "Hackathon",
    eligibility:"Btech student",
    status: "Open",
    logo: "assets/logos/american.png",
    applyLink: "https://unstop.com/hackathons/uber-hacktag-20-uber-technologies-inc-260528?refId=Shiv"
  },
  {
    month: "January",
    company: "RBI",
    name:"SDE Intern Program",
    role: "Software Engineer Intern",
    type: "Reserach Internship",
    eligibility:"2nd/3rd year",
    status: "Open",
    logo: "assets/logos/RBI.png",
    applyLink: "https://careers.microsoft.com/"
  },

  // FEBRUARY
  {
    month: "February",
    company: "Google",
    name:"GSOC 2026", 
    role: "open-source",
    type: "Internship",
    eligibility:"2nd-3rd year",
    status: "Upcoming",
    logo: "assets/logos/google.png",
    applyLink: "https://summerofcode.withgoogle.com/"
  },
  {
    month: "February",
    company: "JP Morgan",
    name:"Code for good",
    role: "Software Engineer Intern",
    type: "Hackathon",
    eligibility:"2nd-3rd year",
    status: "Upcoming",
    logo: "assets/logos/JPmorgan.png",
    applyLink: "https://www.flipkartcareers.com/"
  },
  {
    month: "February",
    company: "Walmart",
    name:"CodeHers",
    role: "Software Engineer Intern",
    type: "Hackathon",
    eligibility:"female",
    status: "Upcoming",
    logo: "assets/logos/walmart.png",
    applyLink: "https://careers.walmart.com/students"
  },
   {
    month: "February",
    company: "Servicenow",
    name:"Women code to win",
    role: "Software Engineer Intern",
    type: "Hackathon",
    eligibility:"female",
    status: "Upcoming",
    logo: "assets/logos/servicenow.png",
    applyLink: "https://www.flipkartcareers.com/"
  },

  // MARCH
    {
    month: "March",
    company: "Justpay",
    name:"DEV-BE02",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"B-Tech Student",
    status: "Upcoming",
    logo: "assets/logos/justpay.png",
    applyLink: "https://joinus.juspay.in/?jobId=DEV-BE02"
  },
    {
    month: "March",
    company: "Github",
    name:"Github Externship",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"3rd year",
    status: "Upcoming",
    logo: "assets/logos/github.png",
    applyLink: "https://github.com/GitHub-Externships"
  },
    {
    month: "March",
    company: "Flipkart",
    name:"Flipkart Runaway",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"2nd-3rd year",
    status: "Upcoming",
    logo: "assets/logos/flipkart.png",
    applyLink: "https://www.flipkartcareers.com/flipkart/runway"
  },
   {
    month: "March",
    company: "Justpay",
    name:"DEV-BE02",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"B-Tech Student",
    status: "Upcoming",
    logo: "assets/logos/justpay.png",
    applyLink: "https://joinus.juspay.in/?jobId=DEV-BE02"
  },

  // APRIL
    {
    month: "April",
    company: "Myntra",
    name:"Hacker-ramp",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"2nd-3rd year",
    status: "Upcoming",
    logo: "assets/logos/myntra.png",
    applyLink: "https://careers.myntra.com/"
  },
    {
    month: "April",
    company: "Linked-in",
    name:"Coach-ln Program",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"2nd/3rd/4th year",
    status: "Upcoming",
    logo: "assets/logos/linked-in.png",
    applyLink: "https://welcomein.my.canva.site/coachin-2026"
  },
  
  {
    month: "April",
    company: "Swiggy",
    name:"SDE Intern Program",
    role: "Business Analyst Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/swiggy.png",
    applyLink: "https://careers.swiggy.com/"
  },
    {
    month: "April",
    company: "Netflix",
    name:"SDE Intern Program",
    role: "Software Engineer",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/netflix.png",
    applyLink: "https://jobs.netflix.com/"
  },

  // MAY
  
       {
    month: "May",
    company: "Microsoft",
    name:"Microsoft Engage Program",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"2nd year",
    status: "Upcoming",
    logo: "assets/logos/microsoft.png",
    applyLink: "https://careers.microsoft.com/v2/global/en/students"
  }, 
    {
    month: "May",
    company: "Cisco",
    name:"Ideathon",
    role: "Software Engineer Intern",
    type: "Hackathon",
    eligibility:"2nd /3rd year",
    status: "Upcoming",
    logo: "assets/logos/cisco.png",
    applyLink: "https://www.cisco.com/c/m/en_in/customer-experience-academy.html"
  },
  {
    month: "May",
    company: "Paytm",
    name:"SDE Intern Program",
    role: "Android Developer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/paytm.png",
    applyLink: "https://paytm.com/careers/"
  },
    {
    month: "May",
    company: "IBM",
    name:"SDE Intern Program",
    role: "Associate Developer",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/ibm.png",
    applyLink: "https://www.ibm.com/careers"
  },

  // JUNE
   {
    month: "June",
    company: "Goldman Sachs",
    name:"Summer Analyst Program",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"3rd year",
    status: "Upcoming",
    logo: "assets/logos/goldman.png",
    applyLink: "https://www.goldmansachs.com/careers/students/programs-and-internships/americas/2026-summer-analyst-program"
  },
   {
    month: "June",
    company: "Swiggy",
    name:"Swiggy Launchpad",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"3rd year",
    status: "Upcoming",
    logo: "assets/logos/swiggy.png",
    applyLink: "https://careers.swiggy.com/#/"
  },
  {
    month: "June",
    company: "Infosys",
    name:"SDE Intern Program",
    role: "System Engineer",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/infosys.png",
    applyLink: "https://www.infosys.com/careers/"
  },
  {
    month: "June",
    company: "TCS",
    role: "Assistant System Engineer",
    name:"SDE Intern Program",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/tcs.png",
    applyLink: "https://www.tcs.com/careers"
  },
  

  // JULY
   {
    month: "July",
    company: "Flipkart",
    name:"Flipkart Grid Program",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/flipkart.png",
    applyLink: "https://www.flipkartcareers.com/flipkart/grid"
  },
    {
    month: "July",
    company: "Justpay",
    name:"DEV-BE02",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"B-Tech Student",
    status: "Upcoming",
    logo: "assets/logos/justpay.png",
    applyLink: "https://joinus.juspay.in/?jobId=DEV-BE02"
  },
  {
    month: "July",
    company: "Wipro",
    role: "Project Engineer",
    name:"SDE Intern Program",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/wipro.png",
    applyLink: "https://careers.wipro.com/"
  },
  {
    month: "July",
    company: "Meta",
    name:"SDE Intern Program",
    role: "Associate Software Engineer",
    type: "Hackathon",
    eligibility:"B-Tech Student",
    status: "Upcoming",
    logo: "assets/logos/meta.png",
    applyLink: "https://www.accenture.com/in-en/careers"
  },

  // AUGUST
   {
    month: "August",
    company: "DEshaw & Co",
    name:"Ascend",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"females",
    status: "Upcoming",
    logo: "assets/logos/deshaw.png",
    applyLink: "https://joinus.juspay.in/?jobId=DEV-BE02"
  },
  {
    month: "August",
    company: "CodeNation",
    name:"CODE AGON",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/codenation.png",
    applyLink: "https://joinus.juspay.in/?jobId=DEV-BE02"
  },
  {
    month: "August",
    company: "JP Morgan",
    name:"coderzz",
    role: "Technology Analyst",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/jpmorgan.png",
    applyLink: "https://careers.jpmorgan.com/"
  },
  {
    month: "August",
    company: "Deloitte",
    name:"coderzz",
    role: "Consulting Analyst",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/deloitte.png",
    applyLink: "https://www2.deloitte.com/careers"
  },

  // SEPTEMBER
    {
    month: "September",
    company: "Google",
    name:"SDE Intern Program",
    role: " SDE Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/google.png",
    applyLink: "https://www.google.com/about/careers/applications/jobs/results?q=internship"
  },
    {
    month: "September",
    company: "adobe",
    name:"SDE Intern Program",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"females",
    status: "Upcoming",
    logo: "assets/logos/adobe.png",
    applyLink: "https://careers.adobe.com/us/en/apply?jobSeqNo=ADOBUSR158531EXTERNALENUS&step=1&stepname=personalInformation"
  },
  {
    month: "September",
    company: "Intel",
    name:"SDE Intern Program",
    role: "Hardware Engineer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/intel.png",
    applyLink: "https://jobs.intel.com/"
  },
  {
    month: "September",
    company: "Qualcomm",
    name:"SDE Intern Program",
    role: "Embedded Systems Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/qualcomm.png",
    applyLink: "https://www.qualcomm.com/company/careers"
  },

  // OCTOBER
    {
    month: "October",
    company: "Deloitte",
    name:"coderzz",
    role: "Consulting Analyst",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/deloitte.png",
    applyLink: "https://www2.deloitte.com/careers"
  },
   {
    month: "October",
    company: "Amazon",
    name: "Hackathon",
    role: "Software Engineer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/amazon.png",
    applyLink: "https://careers.adobe.com/us/en/apply?jobSeqNo=ADOBUSR158531EXTERNALENUS&step=1&stepname=personalInformation"
  },
  {
    month: "October",
    company: "Meta",
    name:"SDE Intern Program",
    role: "Frontend Engineer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/meta.png",
    applyLink: "https://www.metacareers.com/"
  },
  {
    month: "October",
    company: "Netflix",
    name:"SDE Intern Program",
    role: "Software Engineer",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/netflix.png",
    applyLink: "https://jobs.netflix.com/"
  },

  // NOVEMBER
    {
    month: "November",
    company: "Intuit",
    name:"coderzz",
    role: "Consulting Analyst",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/deloitte.png",
    applyLink: "https://www2.deloitte.com/careers"
  },
    {
    month: "November",
    company: "Uber",
    name:"uberStar",
    role: "Consulting Analyst",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/uber.png",
    applyLink: "https://www2.deloitte.com/careers"
  },
  {
    month: "November",
    company: "Apple",
    name:"SDE Intern Program",
    role: "iOS Developer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/apple.png",
    applyLink: "https://www.apple.com/careers/"
  },
  {
    month: "November",
    company: "Salesforce",
    name:"SDE Intern Program",
    role: "Software Engineer",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/salesforce.png",
    applyLink: "https://www.salesforce.com/company/careers/"
  },

  // DECEMBER
  {
    month: "December",
    company: "Oracle",
    name:"SDE Intern Program",
    role: "Cloud Engineer Intern",
    type: "Internship",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/oracle.png",
    applyLink: "https://www.oracle.com/careers/"
  },
  {
    month: "December",
    company: "IBM",
    name:"SDE Intern Program",
    role: "Associate Developer",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/ibm.png",
    applyLink: "https://www.ibm.com/careers"
  },
    {
    month: "December",
    company: "Amazon",
    name:"coderzz",
    role: "Consulting Analyst",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/amazon.png",
    applyLink: "https://www2.deloitte.com/careers"
  },
    {
    month: "December",
    company: "Whipro",
    name:"coderzz",
    role: "Consulting Analyst",
    type: "Placement",
    eligibility:"2nd/3rd year",
    status: "Upcoming",
    logo: "assets/logos/wipro.png",
    applyLink: "https://www2.deloitte.com/careers"
  }
    ].map(addSeedDefaults);

    await Internship.insertMany(internshipSeed);

    // Insert hackathons
    const hackathonSeed = [
      {
     company: "Uber",
     name: "HackTag",
     theme: "Software Engineering",
    techStack: [
    "C++ / Java / Python",
    "Graphs, DP, Advanced Algorithms",
  ],
    status: "Open",
    logo: "assets/logos/uber.png",
    applyLink: "https://www.uber.com/"
  },
  {
    company: "Meta",
    name: "Meta Hacker Cup",
    theme: "Competitive Programming",
    techStack: [
    "C++ / Java / Python",
    "Graphs, DP, Advanced Algorithms"
    
  ],
    status: "Open",
    logo: "assets/logos/meta.png",
    applyLink: "https://www.facebook.com/codingcompetitions"
  },
  {
    company: "Amazon",
    name: "Amazon ML Challenge",
    theme: "Machine Learning",
    techStack: [
    "Python, Pandas, Scikit-learn",
    "XGBoost, TensorFlow"
  ],
    status: "Upcoming",
    logo: "assets/logos/amazon.png",
    applyLink: "https://www.hackerearth.com"
  },
  {
    company: "Nvidia",
    name: "NVIDIA AI Hackathon",
    theme: "Deep Learning",
    techStack: [
    "PyTorch, CUDA",
    "GPUs, RAPIDS"
  ],
    status: "Upcoming",
    logo: "assets/logos/nvidia.png",
    applyLink: "https://www.nvidia.com"
  },
  {
    company: "Apple",
    name: "Apple Swift Student Challenge",
    theme: "App Development",
    techStack: [
    "Swift, SwiftUI",
    "iOS frameworks"
  ],
    status: "Upcoming",
    logo: "assets/logos/apple.png",
    applyLink: "https://developer.apple.com/swift-student-challenge"
  },
  {
    company: "OpenAI",
    name: "OpenAI Hackathon",
    theme: "Generative AI",
    techStack: [
    "OpenAI API",
    "Python / Node.js"
  ],
    status: "Upcoming",
    logo: "assets/logos/OpenAI.png",
    applyLink: "https://openai.com"
  },
  {
    company: "IBM",
    name: "IBM Call for Code",
    theme: "Climate & Social Good",
    techStack: [
    "IBM Cloud",
    "AI, IoT, Blockchain"
  ],
    status: "Upcoming",
    logo: "assets/logos/ibm.png",
    applyLink: "https://www.ibm.com/call-for-code"
  },
  {
    company: "ETH Global",
    name: "ETHGlobal Hackathons",
    theme: "Climate & Social Good",
    techStack: [
    "Solidity",
    "React + Ethers.js"
   ],
    status: "Upcoming",
    logo: "assets/logos/ETHglobal.jpg",
    applyLink: "https://ethglobal.com"
  },
  {
    company: "Solana",
    name: "Solana Global Hackathon",
    theme: "Blockchain",
    techStack: [
    "Rust",
    "Solana SDK"
   ],
    status: "Upcoming",
    logo: "assets/logos/solana.png",
    applyLink: "https://solana.com/hackathons"
  },
  {
    company: "Polkadot",
    name: "Polkadot Decode Hackathon",
    theme: "Web3 Infra",
    techStack: [
    "Rust",
    "Substrate"
   ],
    status: "Upcoming",
    logo: "assets/logos/polkadot.png",
    applyLink: "https://polkadot.network"
  }
    ].map(addSeedDefaults);

    await Hackathon.insertMany(hackathonSeed);

    console.log("✅ Data seeded successfully");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
