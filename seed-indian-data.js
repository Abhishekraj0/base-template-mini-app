// Script to seed Indian data into the database
// Run this after setting up your database schema

const seedData = async () => {
  try {
    console.log('🌱 Seeding Indian data...');
    
    const response = await fetch('http://localhost:3000/api/seed-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`📊 Added ${result.data.leads} leads`);
      console.log(`📋 Added ${result.data.projects} projects`);
      console.log('\n🎉 Your database is now populated with Indian data!');
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev');
  }
};

seedData();