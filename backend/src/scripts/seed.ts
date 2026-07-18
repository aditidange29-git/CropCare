// Seed script — run with: npx tsx src/scripts/seed.ts
// Seeds: languages, disease_library (15 entries), 1 admin, 5 dealers, products
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('Seeding CropCare database...');

  // 1. Languages
  await supabase.from('languages').upsert([
    { code: 'en', label: 'English', is_active: true },
    { code: 'hi', label: 'हिंदी', is_active: true },
    { code: 'mr', label: 'मराठी', is_active: true },
  ], { onConflict: 'code' });
  console.log('Languages seeded');

  // 2. Disease library — 15 real entries
  const diseases = [
    {
      disease_code: 'cotton_leaf_curl',
      crop_type: 'cotton',
      name_translations: { en: 'Cotton Leaf Curl Virus', hi: 'कपास पत्ती कर्ल वायरस', mr: 'कापूस पानकुरळ विषाणू' },
      symptoms: { en: ['Upward leaf curling', 'Vein thickening', 'Dark green discoloration', 'Stunted growth'] },
      causes: 'Caused by Cotton Leaf Curl Virus (CLCuV), transmitted by whitefly (Bemisia tabaci).',
      treatment_protocol: {
        organic: ['Remove infected plants immediately', 'Apply neem oil 5ml/litre every 7 days', 'Install yellow sticky traps', 'Encourage natural predators of whitefly'],
        chemical: ['Imidacloprid 17.8 SL @ 0.3ml/litre', 'Acetamiprid 20 SP @ 0.2g/litre', 'Thiamethoxam 25 WG @ 0.3g/litre']
      }
    },
    {
      disease_code: 'cotton_bollworm',
      crop_type: 'cotton',
      name_translations: { en: 'Cotton Bollworm', hi: 'कपास बोलवर्म', mr: 'कापूस बोंड अळी' },
      symptoms: { en: ['Small holes in bolls', 'Caterpillar inside boll', 'Premature boll opening', 'Lint damage'] },
      causes: 'Helicoverpa armigera larvae bore into cotton bolls, causing severe yield loss.',
      treatment_protocol: {
        organic: ['Install pheromone traps at 5/acre', 'Apply Bt formulation (Bacillus thuringiensis) 2g/litre', 'Hand pick and destroy egg masses', 'Spray NSKE 5%'],
        chemical: ['Chlorpyrifos 20 EC @ 2ml/litre', 'Profenofos 50 EC @ 2ml/litre', 'Indoxacarb 14.5 SC @ 1ml/litre']
      }
    },
    {
      disease_code: 'cotton_fusarium_wilt',
      crop_type: 'cotton',
      name_translations: { en: 'Fusarium Wilt of Cotton', hi: 'कपास फ्यूजेरियम विल्ट', mr: 'कापूस फ्युसेरियम मर' },
      symptoms: { en: ['Yellowing of lower leaves', 'Brown vascular discoloration', 'Wilting despite moist soil', 'Plant death'] },
      causes: 'Soil-borne fungus Fusarium oxysporum f.sp. vasinfectum infects vascular tissue.',
      treatment_protocol: {
        organic: ['Use resistant varieties', 'Apply Trichoderma viride 4g/kg seed treatment', 'Avoid waterlogging', 'Remove and burn infected plants'],
        chemical: ['Carbendazim 50 WP seed treatment @ 2g/kg', 'Drench with Thiophanate methyl 70 WP @ 1g/litre', 'Apply Copper oxychloride 50 WP @ 3g/litre']
      }
    },
    {
      disease_code: 'cotton_aphid',
      crop_type: 'cotton',
      name_translations: { en: 'Cotton Aphid Infestation', hi: 'कपास माहू', mr: 'कापूस माव्याचा प्रादुर्भाव' },
      symptoms: { en: ['Leaf curling downward', 'Sticky honeydew on leaves', 'Sooty mold growth', 'Yellowing of leaves'] },
      causes: 'Aphis gossypii colonies suck sap from leaves, weakening the plant.',
      treatment_protocol: {
        organic: ['Apply neem oil 5ml/litre', 'Spray soap solution (5g soap/litre)', 'Conserve ladybird beetle populations', 'Remove heavily infested leaves'],
        chemical: ['Dimethoate 30 EC @ 1.5ml/litre', 'Imidacloprid 70 WG @ 0.07g/litre', 'Flonicamid 50 WG @ 0.3g/litre']
      }
    },
    {
      disease_code: 'tomato_early_blight',
      crop_type: 'tomato',
      name_translations: { en: 'Tomato Early Blight', hi: 'टमाटर अर्ली ब्लाइट', mr: 'टोमॅटो अर्ली ब्लाइट' },
      symptoms: { en: ['Circular brown spots with concentric rings', 'Yellow halo around spots', 'Lower leaf defoliation', 'Dark lesions on stems'] },
      causes: 'Alternaria solani fungus thrives in warm humid conditions (24–29°C).',
      treatment_protocol: {
        organic: ['Remove infected lower leaves', 'Apply copper-based fungicide (copper sulfate 3g/litre)', 'Avoid overhead irrigation', 'Mulch to prevent soil splash'],
        chemical: ['Mancozeb 75 WP @ 2.5g/litre', 'Chlorothalonil 75 WP @ 2g/litre', 'Azoxystrobin 23 SC @ 1ml/litre']
      }
    },
    {
      disease_code: 'tomato_late_blight',
      crop_type: 'tomato',
      name_translations: { en: 'Tomato Late Blight', hi: 'टमाटर लेट ब्लाइट', mr: 'टोमॅटो उशिरा करपा' },
      symptoms: { en: ['Water-soaked dark lesions on leaves', 'White mold on leaf undersides', 'Brown greasy spots on fruit', 'Rapid plant collapse'] },
      causes: 'Phytophthora infestans, an oomycete that spreads rapidly in cool wet conditions.',
      treatment_protocol: {
        organic: ['Apply Bordeaux mixture 1%', 'Remove and destroy infected plants', 'Improve field drainage', 'Avoid working in wet conditions'],
        chemical: ['Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/litre', 'Cymoxanil + Mancozeb @ 3g/litre', 'Dimethomorph 50 WP @ 1g/litre']
      }
    },
    {
      disease_code: 'tomato_bacterial_wilt',
      crop_type: 'tomato',
      name_translations: { en: 'Tomato Bacterial Wilt', hi: 'टमाटर जीवाणु विल्ट', mr: 'टोमॅटो जिवाणू मर' },
      symptoms: { en: ['Sudden wilting of entire plant', 'Vascular browning when stem cut', 'Milky bacterial ooze in water test', 'No leaf yellowing initially'] },
      causes: 'Ralstonia solanacearum soil bacterium. No cure once established.',
      treatment_protocol: {
        organic: ['No cure — remove and destroy infected plants', 'Solarize soil before next crop', 'Use resistant varieties', 'Practice 3-year crop rotation'],
        chemical: ['Preventive: copper hydroxide drenching @ 3g/litre', 'Streptocycline 0.02% preventive spray', 'Bleaching powder soil treatment']
      }
    },
    {
      disease_code: 'tomato_yellow_leaf_curl',
      crop_type: 'tomato',
      name_translations: { en: 'Tomato Yellow Leaf Curl Virus', hi: 'टमाटर पीला पत्ती कर्ल', mr: 'टोमॅटो पिवळे पान कुरळणे' },
      symptoms: { en: ['Upward and inward leaf curling', 'Interveinal yellowing', 'Stunted plant growth', 'Flower drop'] },
      causes: 'Tomato Yellow Leaf Curl Virus (TYLCV) transmitted by silverleaf whitefly.',
      treatment_protocol: {
        organic: ['Install reflective mulch to deter whitefly', 'Apply neem oil 5ml/litre', 'Remove infected plants early', 'Use virus-free transplants only'],
        chemical: ['Imidacloprid 70 WG @ 0.07g/litre as soil drench', 'Thiamethoxam 25 WG @ 0.3g/litre foliar spray', 'Spiromesifen 240 SC @ 0.9ml/litre']
      }
    },
    {
      disease_code: 'tomato_leaf_miner',
      crop_type: 'tomato',
      name_translations: { en: 'Tomato Leaf Miner', hi: 'टमाटर पत्ती खनिक', mr: 'टोमॅटो पाने पोखरणारी अळी' },
      symptoms: { en: ['Serpentine white mines on leaves', 'Tiny black dots (frass) in mines', 'Premature leaf drop', 'Reduced photosynthesis'] },
      causes: 'Tuta absoluta larvae mine into tomato leaves and fruit causing severe damage.',
      treatment_protocol: {
        organic: ['Mass trapping with pheromone traps', 'Release Trichogramma parasitoids', 'Apply Spinosad 45 SC 0.3ml/litre', 'Remove and destroy heavily mined leaves'],
        chemical: ['Chlorantraniliprole 18.5 SC @ 0.3ml/litre', 'Cyantraniliprole 10 OD @ 1.2ml/litre', 'Emamectin benzoate 5 SG @ 0.5g/litre']
      }
    },
    {
      disease_code: 'wheat_rust',
      crop_type: 'wheat',
      name_translations: { en: 'Wheat Stem Rust', hi: 'गेहूं तना जंग', mr: 'गहू खोड गंज' },
      symptoms: { en: ['Reddish-brown pustules on stems', 'Orange spore masses on leaves', 'Premature grain shriveling', 'Lodging in severe cases'] },
      causes: 'Puccinia graminis f.sp. tritici fungus. Highly destructive in warm humid conditions.',
      treatment_protocol: {
        organic: ['Use certified resistant varieties', 'Early sowing to avoid peak infection period', 'Remove barberry plants (alternate host)', 'Monitor and report to local agriculture office'],
        chemical: ['Propiconazole 25 EC @ 1ml/litre', 'Tebuconazole 250 EW @ 1ml/litre', 'Mancozeb 75 WP @ 2.5g/litre preventive spray']
      }
    },
    {
      disease_code: 'wheat_yellow_rust',
      crop_type: 'wheat',
      name_translations: { en: 'Wheat Yellow Rust', hi: 'गेहूं पीला जंग', mr: 'गहू पिवळा गंज' },
      symptoms: { en: ['Yellow-orange pustules in stripes along leaves', 'White cottony spore masses later', 'Premature leaf drying', 'Significant yield loss'] },
      causes: 'Puccinia striiformis f.sp. tritici. Spreads in cool moist conditions (10–15°C).',
      treatment_protocol: {
        organic: ['Use resistant varieties', 'Avoid excess nitrogen fertilizer', 'Destroy volunteer wheat plants', 'Early monitoring from tillering stage'],
        chemical: ['Propiconazole 25 EC @ 1ml/litre', 'Triadimefon 25 WP @ 1g/litre', 'Hexaconazole 5 EC @ 2ml/litre']
      }
    },
    {
      disease_code: 'wheat_powdery_mildew',
      crop_type: 'wheat',
      name_translations: { en: 'Wheat Powdery Mildew', hi: 'गेहूं पाउडरी मिल्ड्यू', mr: 'गहू भुरी' },
      symptoms: { en: ['White powdery growth on upper leaf surface', 'Yellowing of leaves below mildew', 'Reduced tillering', 'Shriveled grain'] },
      causes: 'Blumeria graminis f.sp. tritici. Favored by warm days and cool nights.',
      treatment_protocol: {
        organic: ['Apply potassium bicarbonate 5g/litre', 'Use resistant varieties', 'Avoid excess nitrogen', 'Improve air circulation through row spacing'],
        chemical: ['Propiconazole 25 EC @ 1ml/litre', 'Tridemorph 80 EC @ 1ml/litre', 'Carbendazim 50 WP @ 1g/litre']
      }
    },
    {
      disease_code: 'wheat_blast',
      crop_type: 'wheat',
      name_translations: { en: 'Wheat Blast', hi: 'गेहूं ब्लास्ट', mr: 'गहू ब्लास्ट' },
      symptoms: { en: ['Bleached spikes with no grain', 'Dark brown lesion at rachis', 'Partial grain filling', 'Grayish-white fungal growth'] },
      causes: 'Magnaporthe oryzae pathotype triticum. Highly destructive in warm humid conditions.',
      treatment_protocol: {
        organic: ['Use certified disease-free seed', 'Remove infected spikes immediately', 'Avoid late planting in high-risk areas', 'Report outbreaks to agriculture department'],
        chemical: ['Trifloxystrobin + Tebuconazole (Nativo) @ 0.5g/litre', 'Azoxystrobin 23 SC @ 1ml/litre', 'Propiconazole 25 EC @ 1ml/litre at boot stage']
      }
    },
    {
      disease_code: 'rice_blast',
      crop_type: 'rice',
      name_translations: { en: 'Rice Blast', hi: 'धान ब्लास्ट', mr: 'भात करपा' },
      symptoms: { en: ['Diamond-shaped lesions with gray center on leaves', 'Neck rotting at panicle base', 'Sterile panicles', 'White to gray lesions on nodes'] },
      causes: 'Magnaporthe oryzae. Most serious rice disease globally, favored by high humidity.',
      treatment_protocol: {
        organic: ['Use silicon fertilizer to strengthen cell walls', 'Avoid excess nitrogen', 'Maintain proper field drainage', 'Use blast-resistant varieties'],
        chemical: ['Tricyclazole 75 WP @ 0.6g/litre', 'Isoprothiolane 40 EC @ 1.5ml/litre', 'Carbendazim 50 WP @ 1g/litre at boot stage']
      }
    },
    {
      disease_code: 'cotton_pink_bollworm',
      crop_type: 'cotton',
      name_translations: { en: 'Pink Bollworm', hi: 'गुलाबी बोलवर्म', mr: 'गुलाबी बोंड अळी' },
      symptoms: { en: ['Pink larvae inside cotton boll', 'Damaged seeds inside boll', 'Webbing inside boll', 'Premature boll opening', 'Circular entry holes in boll'] },
      causes: 'Pectinophora gossypiella (pink bollworm) is a major cotton pest. Pink larvae bore into bolls and feed on seeds, causing severe yield loss.',
      treatment_protocol: {
        organic: ['Install pheromone traps at 5 per acre for mass trapping', 'Release Trichogramma parasitoids (50,000/acre/week)', 'Apply NSKE 5% spray', 'Deep plowing after harvest to destroy pupae', 'Avoid ratoon cotton crop'],
        chemical: ['Chlorpyrifos 20 EC @ 2.5ml/litre', 'Profenofos 50 EC @ 2ml/litre', 'Indoxacarb 14.5 SC @ 1ml/litre', 'Spinosad 45 SC @ 0.3ml/litre']
      }
    },
  ];

  for (const disease of diseases) {
    const { error } = await supabase.from('disease_library').upsert(disease, { onConflict: 'disease_code' });
    if (error) console.error(`Failed to seed ${disease.disease_code}:`, error.message);
  }
  console.log(`Disease library seeded: ${diseases.length} entries`);

  // 3. Admin account
  const adminHash = await bcrypt.hash('Admin@123', 10);
  await supabase.from('admins').upsert([
    { name: 'CropCare Admin', email: 'admin@cropcare.com', password_hash: adminHash }
  ], { onConflict: 'email' });
  console.log('Admin seeded: admin@cropcare.com / Admin@123');

  // 4. Demo dealers (5, all approved, spread across Maharashtra/MP)
  const dealerHash = await bcrypt.hash('Dealer@123', 10);
  const dealers = [
    { shop_name: 'Patil Agro Stores', owner_name: 'Ramesh Patil', email: 'patil@cropcare.demo', phone_number: '+919823456789', whatsapp_number: '+919823456789', location_lat: 21.1458, location_lng: 79.0882, address: 'Plot 12, Agro Market, Nagpur, Maharashtra 440001', status: 'approved' },
    { shop_name: 'Sharma Krishi Kendra', owner_name: 'Vijay Sharma', email: 'sharma@cropcare.demo', phone_number: '+919712345678', whatsapp_number: null, location_lat: 18.5204, location_lng: 73.8567, address: '45 Farmers Lane, Hadapsar, Pune, Maharashtra 411028', status: 'approved' },
    { shop_name: 'Green Field Agro', owner_name: 'Suresh Patel', email: 'greenfield@cropcare.demo', phone_number: '+919645678901', whatsapp_number: '+919645678901', location_lat: 20.9320, location_lng: 77.7523, address: 'Shivaji Chowk, Amravati, Maharashtra 444601', status: 'approved' },
    { shop_name: 'Kisan Agro Center', owner_name: 'Mohan Singh', email: 'kisan@cropcare.demo', phone_number: '+919534567890', whatsapp_number: '+919534567890', location_lat: 19.9975, location_lng: 73.7898, address: 'Mahadik Wadi, Nashik, Maharashtra 422001', status: 'approved' },
    { shop_name: 'Shetkari Agri Mart', owner_name: 'Priya Deshmukh', email: 'shetkari@cropcare.demo', phone_number: '+919423456789', whatsapp_number: '+919423456789', location_lat: 19.8762, location_lng: 75.3433, address: 'CIDCO Colony, Aurangabad, Maharashtra 431003', status: 'approved' },
  ];

  const createdDealers: any[] = [];
  for (const dealer of dealers) {
    const { data, error } = await supabase.from('dealers').upsert(
      { ...dealer, password_hash: dealerHash }, { onConflict: 'email' }
    ).select('id, shop_name').single();
    if (error) { console.error(`Failed to seed dealer ${dealer.shop_name}:`, error.message); continue; }
    if (data) createdDealers.push(data);
  }
  console.log(`Dealers seeded: ${createdDealers.length}`);

  // 5. Products (3-4 per dealer mapped to disease codes)
  const productSets = [
    { dealerIdx: 0, products: [
      { name: 'Confidor (Imidacloprid 17.8 SL)', category: 'Insecticide', applicable_disease_codes: ['cotton_leaf_curl', 'cotton_aphid', 'tomato_yellow_leaf_curl', 'cotton_pink_bollworm'], stock_status: 'in_stock' },
      { name: 'Thimet (Phorate 10G)', category: 'Insecticide', applicable_disease_codes: ['cotton_aphid', 'cotton_bollworm'], stock_status: 'in_stock' },
      { name: 'Ridomil Gold (Metalaxyl+Mancozeb)', category: 'Fungicide', applicable_disease_codes: ['tomato_late_blight', 'tomato_early_blight'], stock_status: 'low' },
    ]},
    { dealerIdx: 1, products: [
      { name: 'Pride (Acetamiprid 20 SP)', category: 'Insecticide', applicable_disease_codes: ['cotton_leaf_curl', 'tomato_leaf_miner'], stock_status: 'in_stock' },
      { name: 'Tata Rallis Mancozeb 75 WP', category: 'Fungicide', applicable_disease_codes: ['tomato_early_blight', 'wheat_rust', 'wheat_yellow_rust'], stock_status: 'in_stock' },
      { name: 'Actara (Thiamethoxam 25 WG)', category: 'Insecticide', applicable_disease_codes: ['cotton_leaf_curl', 'cotton_aphid'], stock_status: 'in_stock' },
    ]},
    { dealerIdx: 2, products: [
      { name: 'Nativo (Trifloxystrobin+Tebuconazole)', category: 'Fungicide', applicable_disease_codes: ['wheat_blast', 'wheat_rust', 'rice_blast'], stock_status: 'in_stock' },
      { name: 'Coragen (Chlorantraniliprole 18.5 SC)', category: 'Insecticide', applicable_disease_codes: ['cotton_bollworm', 'tomato_leaf_miner'], stock_status: 'low' },
      { name: 'Copper Oxychloride 50 WP', category: 'Fungicide', applicable_disease_codes: ['tomato_bacterial_wilt', 'cotton_fusarium_wilt'], stock_status: 'in_stock' },
      { name: 'Spinosad 45 SC (Tracer)', category: 'Insecticide', applicable_disease_codes: ['cotton_pink_bollworm', 'cotton_bollworm', 'tomato_leaf_miner'], stock_status: 'in_stock' },
    ]},
    { dealerIdx: 3, products: [
      { name: 'Bavistin (Carbendazim 50 WP)', category: 'Fungicide', applicable_disease_codes: ['wheat_powdery_mildew', 'rice_blast', 'cotton_fusarium_wilt'], stock_status: 'in_stock' },
      { name: 'Propiconazole 25 EC', category: 'Fungicide', applicable_disease_codes: ['wheat_rust', 'wheat_yellow_rust', 'wheat_blast'], stock_status: 'in_stock' },
      { name: 'Tricyclazole 75 WP', category: 'Fungicide', applicable_disease_codes: ['rice_blast'], stock_status: 'low' },
    ]},
    { dealerIdx: 4, products: [
      { name: 'Bt Formulation (Biobit)', category: 'Biopesticide', applicable_disease_codes: ['cotton_bollworm', 'tomato_leaf_miner'], stock_status: 'in_stock' },
      { name: 'Spinosad 45 SC', category: 'Insecticide', applicable_disease_codes: ['tomato_leaf_miner', 'cotton_bollworm'], stock_status: 'in_stock' },
      { name: 'Cymoxanil + Mancozeb', category: 'Fungicide', applicable_disease_codes: ['tomato_late_blight', 'tomato_early_blight'], stock_status: 'in_stock' },
      { name: 'Emamectin Benzoate 5 SG', category: 'Insecticide', applicable_disease_codes: ['tomato_leaf_miner', 'cotton_bollworm'], stock_status: 'low' },
    ]},
  ];

  for (const set of productSets) {
    const dealer = createdDealers[set.dealerIdx];
    if (!dealer) continue;
    for (const product of set.products) {
      // Check if product already exists for this dealer
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('dealer_id', dealer.id)
        .eq('name', product.name)
        .single();
      if (existing) {
        // Update existing row
        const { error } = await supabase
          .from('products')
          .update({ ...product, dealer_id: dealer.id })
          .eq('id', existing.id);
        if (error) console.error(`Failed to update product ${product.name}:`, error.message);
      } else {
        // Insert new row
        const { error } = await supabase.from('products').insert({ ...product, dealer_id: dealer.id });
        if (error) console.error(`Failed to seed product ${product.name}:`, error.message);
      }
    }
  }
  console.log('Products seeded');
  console.log('\nSeed complete! Login with admin@cropcare.com / Admin@123');
  console.log('Dealer logins: patil@cropcare.demo, sharma@cropcare.demo, etc. / Dealer@123');
}

main().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
