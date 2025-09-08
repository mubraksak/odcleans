import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"


// In your API route, add this function



export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // Property Details
      serviceType,
      propertyType,
      bedrooms,
      bathrooms,
      squareFootage,
      cleaningType,
      cleaningFrequency,
      hasPets,
      desiredDate1,
      desiredDate2,
      desiredDate3,
      
      // Additional Services
      laundry,
      foldingClothes,
      fridgeCleaning,
      baseboardCleaning,
      cabinetCleaning,
      windowCleaning,
      additionalDetails,
      
      // Contact Details
      name,
      email,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      specialInstructions,
    } = body

    // Validate required fields
    const requiredFields = [
      'serviceType', 'propertyType', 'bedrooms', 'bathrooms', 'cleaningType',
      'name', 'email', 'phone', 'streetAddress', 'city', 'state', 'zipCode'
    ]
    
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missing: missingFields },
        { status: 400 }
      )
    }

    // Log the data that will be processed
    console.log("Processing quote for:", { name, email, phone })
    console.log("Property details:", { serviceType, propertyType, bedrooms, bathrooms })

    // Check if user exists, create if not
    let userId: number
    const existingUsers = (await query(
      "SELECT id FROM users WHERE email = ?", 
      [email]
    )) as any[]

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id
      // Update user info
      await query(
        "UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [name, phone, userId]
      )
    } else {
      // Create new user
      const userResult = (await query(
        "INSERT INTO users (email, name, phone) VALUES (?, ?, ?)",
        [email, name, phone]
      )) as any
      userId = userResult.insertId
    }

    // Create quote request
    const quoteResult = (await query(
      `INSERT INTO quote_requests 
       (user_id, service_type, property_type, bedrooms, bathrooms, square_footage, 
        cleaning_type, cleaning_frequency, has_pets, desired_date1, desired_date2, desired_date3,
        contact_name, contact_email, contact_phone, street_address, city, state, zip_code,
        special_instructions, additional_details, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        serviceType,
        propertyType,
        bedrooms,
        bathrooms,
        squareFootage || null,
        cleaningType,
        cleaningFrequency || null,
        hasPets === 'yes' ? true : false,
        desiredDate1 || null,
        desiredDate2 || null,
        desiredDate3 || null,
        name,
        email,
        phone,
        streetAddress,
        city,
        state,
        zipCode,
        specialInstructions || null,
        additionalDetails || null
      ]
    )) as any

    const quoteId = quoteResult.insertId

    // Add additional services if selected
    const additionalServices = [
      { service: 'laundry', selected: laundry },
      { service: 'folding_clothes', selected: foldingClothes },
      { service: 'fridge_cleaning', selected: fridgeCleaning },
      { service: 'baseboard_cleaning', selected: baseboardCleaning },
      { service: 'cabinet_cleaning', selected: cabinetCleaning },
      { service: 'window_cleaning', selected: windowCleaning }
    ]

    for (const { service, selected } of additionalServices) {
      if (selected) {
        await query(
          `INSERT INTO quote_additional_services (quote_id, service_type)
           VALUES (?, ?)`,
          [quoteId, service]
        )
      }
    }


    console.log("Calculating price...")
    const estimatedPrice = await calculateQuotePrice(quoteId)
    console.log("Calculated price:", estimatedPrice)

    // const estimatedPrice = await calculateQuotePrice(quoteId);
    

    return NextResponse.json({
      success: true,
      quoteId: quoteId,
      estimatedPrice: estimatedPrice,
      message: "Quote request submitted successfully",
    })

  } catch (error) {
    console.error("Error creating quote request:", error)
    return NextResponse.json(
      { error: "Failed to submit quote request" }, 
      { status: 500 }
    )
  }
}


// Add the calculation function
async function calculateQuotePrice(quoteId: number): Promise<number> {
  try {
    const quoteData = (await query(
      `SELECT qr.*, sp.base_price, sp.price_per_bedroom, sp.price_per_bathroom, 
              sp.price_per_sqft, sp.min_price, sp.max_price
       FROM quote_requests qr
       JOIN service_pricing sp ON qr.cleaning_type = sp.service_type AND sp.is_active = 1
       WHERE qr.id = ?`,
      [quoteId]
    )) as any[];

    if (quoteData.length === 0) return 0;

    const quote = quoteData[0];
    
    let basePrice = quote.base_price;
    basePrice += (quote.bedrooms * quote.price_per_bedroom);
    basePrice += (quote.bathrooms * quote.price_per_bathroom);
    basePrice += ((quote.square_footage || 0) * quote.price_per_sqft);

    basePrice = Math.max(quote.min_price, Math.min(quote.max_price, basePrice));

    const additionalServices = (await query(
      `SELECT SUM(asp.base_price) as total
       FROM quote_additional_services qas
       JOIN additional_service_pricing asp ON qas.name = asp.name AND asp.is_active = 1
       WHERE qas.quote_id = ?`,
      [quoteId]
    )) as any[];

    const additionalPrice = additionalServices[0]?.total || 0;
    const totalPrice = basePrice + additionalPrice;

    await query(
      `UPDATE quote_requests 
       SET base_price = ?, additional_services_price = ?, total_price = ?, 
           final_price = ?, updated_at = NOW()
       WHERE id = ?`,
      [basePrice, additionalPrice, totalPrice, totalPrice, quoteId]
    );

    return totalPrice;

  } catch (error) {
    console.error("Error calculating quote price:", error);
    return 0;
  }
}