/**
 * Asset API Testing Script
 *
 * This script tests the Asset Management API endpoints
 * Run with: npx tsx test-asset-api.ts
 */

async function testAssetAPI() {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 Testing Asset Management API...\n')

  // First, we need to login to get a session
  console.log('Step 1: Login to get session cookie')
  console.log('Please login manually at http://localhost:3000/auth/signin')
  console.log('Then copy your session cookie and update this test script\n')

  // For testing, you'll need to replace this with actual session cookie
  const sessionCookie = 'YOUR_SESSION_COOKIE_HERE'

  if (sessionCookie === 'YOUR_SESSION_COOKIE_HERE') {
    console.log('❌ Please update the sessionCookie variable with your actual session cookie')
    console.log('\nTo get your session cookie:')
    console.log('1. Login at http://localhost:3000/auth/signin')
    console.log('2. Open browser DevTools > Application > Cookies')
    console.log('3. Copy the value of "next-auth.session-token"\n')
    return
  }

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `next-auth.session-token=${sessionCookie}`
  }

  try {
    // Test 1: List all assets
    console.log('Test 1: GET /api/assets (list all)')
    const listResponse = await fetch(`${baseUrl}/api/assets`, {
      headers
    })
    const listData = await listResponse.json()
    console.log(`Status: ${listResponse.status}`)
    console.log('Response:', JSON.stringify(listData, null, 2))
    console.log('✅ List assets\n')

    // Get homeId from first home
    let homeId: string | null = null
    if (listData.assets && listData.assets.length > 0) {
      homeId = listData.assets[0].homeId
    }

    if (!homeId) {
      console.log('❌ No home found. Please ensure you have a home in the database')
      return
    }

    // Test 2: Create new asset
    console.log('Test 2: POST /api/assets (create)')
    const createResponse = await fetch(`${baseUrl}/api/assets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        homeId,
        name: 'Test Dishwasher',
        category: 'APPLIANCE',
        modelNumber: 'Samsung DW80R5061US',
        purchaseDate: '2024-01-15'
      })
    })
    const createData = await createResponse.json()
    console.log(`Status: ${createResponse.status}`)
    console.log('Response:', JSON.stringify(createData, null, 2))

    if (createResponse.status !== 201) {
      console.log('❌ Failed to create asset\n')
      return
    }

    const assetId = createData.id
    console.log('✅ Created asset\n')

    // Test 3: Get single asset
    console.log('Test 3: GET /api/assets/[id] (single)')
    const getResponse = await fetch(`${baseUrl}/api/assets/${assetId}`, {
      headers
    })
    const getData = await getResponse.json()
    console.log(`Status: ${getResponse.status}`)
    console.log('Response:', JSON.stringify(getData, null, 2))
    console.log('✅ Get single asset\n')

    // Test 4: Update asset
    console.log('Test 4: PUT /api/assets/[id] (update)')
    const updateResponse = await fetch(`${baseUrl}/api/assets/${assetId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Updated Dishwasher Name',
        modelNumber: 'Samsung DW80R5061US-V2'
      })
    })
    const updateData = await updateResponse.json()
    console.log(`Status: ${updateResponse.status}`)
    console.log('Response:', JSON.stringify(updateData, null, 2))
    console.log('✅ Updated asset\n')

    // Test 5: Filter by category
    console.log('Test 5: GET /api/assets?category=APPLIANCE (filter)')
    const filterResponse = await fetch(`${baseUrl}/api/assets?category=APPLIANCE`, {
      headers
    })
    const filterData = await filterResponse.json()
    console.log(`Status: ${filterResponse.status}`)
    console.log('Response:', JSON.stringify(filterData, null, 2))
    console.log('✅ Filter assets\n')

    // Test 6: Search assets
    console.log('Test 6: GET /api/assets?search=dishwasher (search)')
    const searchResponse = await fetch(`${baseUrl}/api/assets?search=dishwasher`, {
      headers
    })
    const searchData = await searchResponse.json()
    console.log(`Status: ${searchResponse.status}`)
    console.log('Response:', JSON.stringify(searchData, null, 2))
    console.log('✅ Search assets\n')

    // Test 7: Delete asset
    console.log('Test 7: DELETE /api/assets/[id] (delete)')
    const deleteResponse = await fetch(`${baseUrl}/api/assets/${assetId}`, {
      method: 'DELETE',
      headers
    })
    console.log(`Status: ${deleteResponse.status}`)
    console.log('✅ Deleted asset\n')

    console.log('🎉 All tests completed successfully!')

  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

testAssetAPI()
