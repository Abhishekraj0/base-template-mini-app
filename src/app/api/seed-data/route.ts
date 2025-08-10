import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

// Indian names, companies, and locations for realistic data
const indianNames = [
  "Aarav Sharma", "Vivaan Gupta", "Aditya Singh", "Vihaan Patel", "Arjun Kumar",
  "Sai Reddy", "Reyansh Agarwal", "Ayaan Khan", "Krishna Rao", "Ishaan Joshi",
  "Shaurya Mehta", "Atharv Verma", "Advik Nair", "Pranav Iyer", "Rudra Pandey",
  "Ananya Sharma", "Diya Gupta", "Aadhya Singh", "Kavya Patel", "Arya Kumar",
  "Myra Reddy", "Anika Agarwal", "Saanvi Khan", "Kiara Rao", "Navya Joshi",
  "Pari Mehta", "Avni Verma", "Riya Nair", "Tara Iyer", "Zara Pandey",
  "Rajesh Malhotra", "Priya Kapoor", "Amit Bansal", "Neha Chopra", "Vikram Sethi",
  "Pooja Aggarwal", "Rohit Bhatia", "Sneha Mittal", "Karan Khanna", "Deepika Goel",
  "Suresh Jindal", "Kavita Saxena", "Manish Goyal", "Ritu Arora", "Ashish Singhal",
  "Sunita Bhardwaj", "Rakesh Tiwari", "Meera Srivastava", "Nitin Jain", "Shweta Gupta",
  "Harish Chandra", "Lata Devi", "Mohan Lal", "Geeta Rani", "Sunil Kumar",
  "Radha Kumari", "Dinesh Prasad", "Sita Devi", "Ramesh Yadav", "Kamala Devi",
  "Vijay Singh", "Urmila Sharma", "Naresh Gupta", "Pushpa Devi", "Mahesh Kumar",
  "Savita Rani", "Yogesh Sharma", "Rekha Devi", "Santosh Kumar", "Manju Devi",
  "Arun Kumar", "Sunita Sharma", "Ravi Gupta", "Kiran Devi", "Sanjay Singh",
  "Nirmala Devi", "Ajay Kumar", "Seema Sharma", "Vinod Gupta", "Asha Devi",
  "Manoj Kumar", "Usha Sharma", "Pankaj Gupta", "Vandana Devi", "Sudhir Singh",
  "Anita Sharma", "Rajesh Kumar", "Sushma Gupta", "Mukesh Singh", "Renu Devi",
  "Anil Kumar", "Bharti Sharma", "Ramesh Gupta", "Sudha Devi", "Prakash Singh",
  "Mamta Sharma", "Deepak Kumar", "Nisha Gupta", "Sushil Singh", "Kalpana Devi"
];

const indianCompanies = [
  "Tata Consultancy Services", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra",
  "Cognizant India", "Accenture India", "IBM India", "Microsoft India", "Google India",
  "Amazon India", "Flipkart", "Paytm", "Ola", "Swiggy", "Zomato", "BYJU'S",
  "Unacademy", "PhonePe", "Razorpay", "Freshworks", "Zoho", "InMobi", "Mu Sigma",
  "Mindtree", "Mphasis", "L&T Infotech", "Capgemini India", "Oracle India", "SAP India",
  "Reliance Industries", "Bharti Airtel", "HDFC Bank", "ICICI Bank", "State Bank of India",
  "Axis Bank", "Kotak Mahindra Bank", "Yes Bank", "IndusInd Bank", "Federal Bank",
  "Mahindra Group", "Bajaj Group", "Aditya Birla Group", "ITC Limited", "Hindustan Unilever",
  "Asian Paints", "Maruti Suzuki", "Hero MotoCorp", "Bajaj Auto", "TVS Motor Company"
];

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar",
  "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad",
  "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
  "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur"
];

const indianIndustries = [
  "Information Technology", "Software Development", "E-commerce", "Fintech", "Healthcare",
  "Education Technology", "Manufacturing", "Automotive", "Telecommunications", "Banking",
  "Insurance", "Real Estate", "Retail", "Pharmaceuticals", "Textiles", "Agriculture",
  "Food Processing", "Energy", "Construction", "Media & Entertainment", "Travel & Tourism",
  "Logistics", "Consulting", "Digital Marketing", "Biotechnology"
];

const projectTypes = [
  "Mobile App Development", "Web Application", "E-commerce Platform", "ERP System",
  "CRM Implementation", "Digital Transformation", "Cloud Migration", "Data Analytics",
  "AI/ML Solution", "Blockchain Development", "IoT Implementation", "Cybersecurity",
  "Digital Marketing Campaign", "Brand Identity Design", "Website Redesign",
  "Software Integration", "API Development", "Database Optimization", "DevOps Setup",
  "Quality Assurance", "Business Intelligence", "Automation Solution", "Training Program",
  "Consulting Services", "System Modernization"
];

export async function POST() {
  try {
    console.log("🌱 Starting to seed Indian data...");

    // Generate 100 Indian leads
    const leads = [];
    for (let i = 0; i < 100; i++) {
      const name = indianNames[Math.floor(Math.random() * indianNames.length)];
      const company = indianCompanies[Math.floor(Math.random() * indianCompanies.length)];
      const city = indianCities[Math.floor(Math.random() * indianCities.length)];
      const industry = indianIndustries[Math.floor(Math.random() * indianIndustries.length)];
      
      // Generate realistic email
      const emailName = name.toLowerCase().replace(/\s+/g, '.');
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', company.toLowerCase().replace(/\s+/g, '') + '.com'];
      const email = `${emailName}@${domains[Math.floor(Math.random() * domains.length)]}`;
      
      // Generate phone number (Indian format)
      const phone = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      
      // Assign categories based on company type
      let category = 'individual';
      if (company.includes('TCS') || company.includes('Infosys') || company.includes('Wipro')) {
        category = 'enterprise';
      } else if (company.includes('Startup') || company.includes('Tech')) {
        category = 'startup';
      } else if (company.includes('Bank') || company.includes('Industries')) {
        category = 'enterprise';
      } else {
        category = Math.random() > 0.5 ? 'small-business' : 'startup';
      }
      
      // Generate salary ranges based on category and city
      let salaryMin, salaryMax, budgetRange;
      const isTierOneCity = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'].includes(city);
      
      if (category === 'enterprise') {
        salaryMin = isTierOneCity ? 800000 : 600000; // 8-6 lakhs
        salaryMax = isTierOneCity ? 2500000 : 2000000; // 25-20 lakhs
        budgetRange = Math.random() > 0.3 ? 'enterprise' : 'high';
      } else if (category === 'startup') {
        salaryMin = isTierOneCity ? 400000 : 300000; // 4-3 lakhs
        salaryMax = isTierOneCity ? 1200000 : 1000000; // 12-10 lakhs
        budgetRange = Math.random() > 0.4 ? 'medium' : 'high';
      } else {
        salaryMin = isTierOneCity ? 300000 : 200000; // 3-2 lakhs
        salaryMax = isTierOneCity ? 800000 : 600000; // 8-6 lakhs
        budgetRange = Math.random() > 0.6 ? 'low' : 'medium';
      }
      
      const statuses = ['new', 'contacted', 'qualified', 'closed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate notes
      const notes = [
        `Interested in ${industry.toLowerCase()} solutions`,
        `Looking for cost-effective options`,
        `Prefers local vendors`,
        `Has experience with similar projects`,
        `Budget conscious but quality focused`,
        `Needs quick turnaround`,
        `Long-term partnership potential`,
        `Referred by existing client`,
        `Active on LinkedIn`,
        `Attended industry conference`
      ];
      
      leads.push({
        name,
        email,
        phone,
        company,
        category,
        salary_min: salaryMin,
        salary_max: salaryMax,
        budget_range: budgetRange,
        industry,
        location: `${city}, India`,
        notes: notes[Math.floor(Math.random() * notes.length)],
        status
      });
    }

    // Insert leads into database
    const { data: insertedLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(leads)
      .select();

    if (leadsError) {
      console.error("Error inserting leads:", leadsError);
      return NextResponse.json({ error: "Failed to insert leads" }, { status: 500 });
    }

    console.log(`✅ Inserted ${insertedLeads?.length} leads`);

    // Generate 30 Indian projects
    const projects = [];
    for (let i = 0; i < 30; i++) {
      const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
      const company = indianCompanies[Math.floor(Math.random() * indianCompanies.length)];
      const city = indianCities[Math.floor(Math.random() * indianCities.length)];
      
      // Generate project name
      const projectName = `${projectType} for ${company}`;
      
      // Generate budget based on project type and company
      let budget;
      if (projectType.includes('AI') || projectType.includes('Blockchain') || projectType.includes('Digital Transformation')) {
        budget = Math.floor(Math.random() * 5000000) + 2000000; // 20L - 70L
      } else if (projectType.includes('Mobile App') || projectType.includes('Web Application')) {
        budget = Math.floor(Math.random() * 2000000) + 500000; // 5L - 25L
      } else if (projectType.includes('ERP') || projectType.includes('CRM')) {
        budget = Math.floor(Math.random() * 3000000) + 1000000; // 10L - 40L
      } else {
        budget = Math.floor(Math.random() * 1500000) + 200000; // 2L - 17L
      }
      
      // Generate description
      const descriptions = [
        `Comprehensive ${projectType.toLowerCase()} solution tailored for ${company}`,
        `Modern and scalable ${projectType.toLowerCase()} with latest technologies`,
        `End-to-end ${projectType.toLowerCase()} including design, development, and deployment`,
        `Custom ${projectType.toLowerCase()} with integration capabilities`,
        `Enterprise-grade ${projectType.toLowerCase()} with security focus`,
        `User-friendly ${projectType.toLowerCase()} with mobile responsiveness`,
        `Cloud-based ${projectType.toLowerCase()} with high availability`,
        `Innovative ${projectType.toLowerCase()} leveraging cutting-edge technology`
      ];
      
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Generate dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90)); // Start within 90 days
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 180) + 30); // 30-210 days duration
      
      const statuses = ['planning', 'active', 'on-hold', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      projects.push({
        name: projectName,
        description,
        client_name: company,
        budget,
        status,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
    }

    // Insert projects into database
    const { data: insertedProjects, error: projectsError } = await supabase
      .from('projects')
      .insert(projects)
      .select();

    if (projectsError) {
      console.error("Error inserting projects:", projectsError);
      return NextResponse.json({ error: "Failed to insert projects" }, { status: 500 });
    }

    console.log(`✅ Inserted ${insertedProjects?.length} projects`);

    return NextResponse.json({
      success: true,
      message: "Successfully seeded Indian data",
      data: {
        leads: insertedLeads?.length || 0,
        projects: insertedProjects?.length || 0
      }
    });

  } catch (error) {
    console.error("Seed data error:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}