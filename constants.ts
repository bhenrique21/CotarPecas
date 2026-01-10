
import { VehicleType } from "./types";

export const BRAZIL_STATES = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

export const VEHICLE_MAKES: Record<VehicleType, string[]> = {
  [VehicleType.CARRO]: [
    "Chevrolet", "Volkswagen", "Fiat", "Ford", "Toyota", "Hyundai", "Honda", "Jeep", "Renault", "Nissan", "Mitsubishi", "BMW", "Mercedes-Benz", "Audi", "Peugeot", "Citroën", "Kia", "BYD", "Chery", "Land Rover", "Volvo", "Dodge", "Subaru"
  ],
  [VehicleType.MOTO]: [
    "Honda", "Yamaha", "Suzuki", "BMW", "Kawasaki", "Triumph", "Harley-Davidson", "Ducati", "Royal Enfield", "Dafra", "KTM", "Bajaj", "Shineray"
  ],
  [VehicleType.CAMINHAO]: [
    "Mercedes-Benz", "Scania", "Volvo", "Volkswagen", "Iveco", "DAF", "Ford", "MAN", "Sinotruk"
  ],
  [VehicleType.ONIBUS]: [
    "Mercedes-Benz", "Volkswagen", "Scania", "Volvo", "Agrale", "Iveco", "Marcopolo", "Caio", "Busscar"
  ]
};

// Expanded Database of models
export const VEHICLE_MODELS: Record<string, string[]> = {
  // --- CARROS ---
  "Chevrolet": [
    "Onix", "Onix Plus", "Tracker", "S10", "Cruze", "Cruze Sport6", "Spin", "Equinox", "Trailblazer", "Montana", "Camaro", "Bolt EUV", 
    "Celta", "Classic", "Prisma", "Cobalt", "Captiva", "Astra", "Vectra", "Vectra GT", "Omega", "Opala", "Chevette", "Kadett", "Monza", 
    "Agile", "Meriva", "Zafira", "Sonic", "Malibu", "Blazer", "Silverado", "D20", "Veraneio", "Marajó", "Ipanema", "Suprema", "Tigra"
  ],
  "Volkswagen": [
    "Polo", "Polo Track", "T-Cross", "Nivus", "Virtus", "Taos", "Tiguan Allspace", "Jetta", "Jetta GLI", "Amarok", "Saveiro", "Gol", 
    "Voyage", "Fox", "CrossFox", "SpaceFox", "Up!", "Golf", "Golf GTI", "Passat", "Fusca", "Kombi", "Santana", "Parati", "Bora", "New Beetle",
    "Touareg", "T-Roc", "ID.4", "ID.Buzz", "Pointer", "Logus", "Apollo", "Brasilia", "Variant", "TL", "SP2"
  ],
  "Fiat": [
    "Strada", "Mobi", "Argo", "Cronos", "Pulse", "Pulse Abarth", "Fastback", "Toro", "Fiorino", "Ducato", "Scudo", "Titano", "500e",
    "Uno", "Uno Mille", "Palio", "Palio Weekend", "Siena", "Grand Siena", "Punto", "Idea", "Stilo", "Linea", "Bravo", "Doblo", "Freemont",
    "Tempra", "Tipo", "Marea", "Marea Weekend", "Oggi", "Panorama", "Elba", "Premio", "147"
  ],
  "Ford": [
    "Ranger", "Maverick", "Bronco Sport", "Mustang", "Mustang Mach-E", "Territory", "Transit", "F-150",
    "Ka", "Ka Sedan", "EcoSport", "Fiesta", "Fiesta Sedan", "Focus", "Focus Sedan", "Fusion", "Edge", "Courier", "F-250", "F-1000",
    "Verona", "Versailles", "Royale", "Del Rey", "Corcel", "Belina", "Pampa", "Escort", "Escort Hobby", "Mondeo", "Taurus"
  ],
  "Toyota": [
    "Hilux", "Corolla", "Corolla Cross", "Yaris Hatch", "Yaris Sedan", "SW4", "RAV4", "Camry", "Prius", "GR Corolla",
    "Etios Hatch", "Etios Sedan", "Fielder", "Bandeirante", "Corona", "Paseo", "Previa", "Supra", "Celica"
  ],
  "Hyundai": [
    "HB20", "HB20S", "Creta", "Tucson", "New Tucson", "Santa Fe", "Palisade", "Ioniq 5", "Kona",
    "IX35", "Azera", "Elantra", "Sonata", "Veloster", "HR", "Vera Cruz", "i30", "i30 CW", "HB20X", "Accent", "Terracan"
  ],
  "Honda": [
    "Civic", "Civic Type R", "HR-V", "City", "City Hatch", "Fit", "WR-V", "CR-V", "Accord", "ZR-V",
    "Civic Si", "Prelude", "Odyssey", "Pilot", "Legend"
  ],
  "Jeep": [
    "Renegade", "Compass", "Commander", "Wrangler", "Gladiator", "Grand Cherokee", "Cherokee", "Grand Cherokee 4xe", "Avenger"
  ],
  "Renault": [
    "Kwid", "Kwid E-Tech", "Duster", "Oroch", "Master", "Sandero", "Sandero RS", "Logan", "Captur", "Stepway", "Megane E-Tech", "Kardian",
    "Clio", "Megane Grand Tour", "Fluence", "Symbol", "Kangoo", "Scenic", "Grand Scenic", "Twingo", "Laguna", "Safrane", "R19", "Gordini"
  ],
  "Nissan": [
    "Kicks", "Versa", "Sentra", "Frontier", "Leaf", "March", "Tiida", "Livina", "Grand Livina", "X-Terra", "Pathfinder", "Murano", "Altima", "Maxima", "350Z", "370Z", "GT-R"
  ],
  "Mitsubishi": [
    "L200 Triton", "L200 Triton Sport", "Pajero Sport", "Eclipse Cross", "ASX", "Outlander", "Outlander Sport", 
    "Lancer", "Lancer Evolution", "Pajero TR4", "Pajero Full", "Pajero Dakar", "Pajero IO", "Galant", "Grandis", "Eclipse", "3000GT", "Colt", "Space Wagon"
  ],
  "BMW": [
    "Série 3 (320i/328i/330i)", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Série 1 (118i/120i)", "Série 2", "Série 4", "Série 5", "Série 7", 
    "M2", "M3", "M4", "M5", "i3", "iX", "iX1", "iX3", "i4", "Z3", "Z4"
  ],
  "Mercedes-Benz": [
    "Classe C (C180/C200/C300)", "Classe A (A200/A250)", "GLA", "GLB", "GLC", "GLE", "GLS", "Classe E", "Classe S", "CLA", "CLS", "Sprinter", "Vito", "SLK", "SLC", "G-Class", "EQA", "EQB", "EQC", "EQE", "EQS"
  ],
  "Audi": [
    "A1", "A3 Sedan", "A3 Sportback", "A4", "A5", "A6", "A7", "Q3", "Q5", "Q7", "Q8", "e-tron", "e-tron GT", "RS3", "RS4", "RS5", "RS6", "RS Q3", "RS Q8", "TT", "R8"
  ],
  "Peugeot": [
    "208", "e-208", "2008", "3008", "5008", "Partner", "Expert", "Boxer", 
    "206", "207", "307", "308", "408", "RCZ", "Hoggar", "106", "306", "405", "406", "504"
  ],
  "Citroën": [
    "C3", "C3 Aircross", "C4 Cactus", "C4 Lounge", "C4 Pallas", "C4 Hatch", "C5 Aircross", "Jumpy", "Jumper", 
    "Xsara", "Xsara Picasso", "C3 Picasso", "Aircross", "DS3", "DS4", "DS5", "C5", "C8", "Berlingo", "ZX", "Xantia", "XM"
  ],
  "Kia": [
    "Sportage", "Cerato", "Sorento", "Picanto", "Soul", "Carnival", "Stonic", "Niro", "Bongo", "Mohave", "Carens", "Optima", "Cadenza", "Quoris", "Opirus", "Clarus", "Sephia", "Bestat"
  ],
  "BYD": [
    "Dolphin", "Dolphin Mini", "Song Plus", "Seal", "Yuan Plus", "Tan", "Han", "King"
  ],
  "Chery": [
    "Tiggo 2", "Tiggo 3x", "Tiggo 5x", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6", "iCar", "QQ", "Celer", "Face", "Cielo", "Tiggo"
  ],
  "Land Rover": [
    "Discovery Sport", "Discovery", "Range Rover Evoque", "Range Rover Velar", "Range Rover Sport", "Range Rover", "Defender", "Freelander"
  ],
  "Volvo": [
    "XC40", "XC60", "XC90", "C40", "EX30", "EX90", "S60", "S90", "V40", "V60", "C30", "S40", "V50", "850"
  ],
  "Subaru": [
    "Forester", "XV", "Crosstrek", "Outback", "Impreza", "WRX", "WRX STI", "Legacy", "Tribeca"
  ],
  "Dodge": [
    "Ram 1500", "Ram 2500", "Ram 3500", "Ram Classic", "Rampage", "Journey", "Durango", "Dakota", "Dart", "Charger", "Challenger"
  ],

  // --- MOTOS ---
  "Honda ": [
    "CG 160 Fan", "CG 160 Titan", "CG 160 Start", "CG 160 Cargo", "Biz 125", "Biz 110i", "NXR 160 Bros", "Pop 110i", 
    "CB 250F Twister", "CB 300F Twister", "XRE 300", "XRE 190", "Sahara 300", "PCX 160", "Elite 125", "ADV 150", 
    "CB 500X", "CB 500F", "NC 750X", "CRF 250F", "CRF 230F", "Africa Twin 1100", "CBR 650R", "CB 650R", "CBR 1000RR-R Fireblade", "Gold Wing", 
    "CB 1000R", "Hornet", "CB 600F", "Shadow 750", "Shadow 600", "XLX 350", "NX 4 Falcon", "Tornado 250"
  ],
  "Yamaha": [
    "Fazer 250 (FZ25)", "Fazer 150", "Crosser 150", "Lander 250", "Tenere 250", "NMAX 160", "XMAX 250", "Factor 125", "Factor 150", 
    "Neo 125", "Fluo 125", "MT-03", "MT-07", "MT-09", "R3", "R15", "Tracer 900", "Super Ténéré 1200", "R1", "XJ6", "XT 660", "XT 600", "YBR 125", "Crypton"
  ],
  "Suzuki": [
    "GSX-S750", "GSX-S1000", "V-Strom 650", "V-Strom 1050", "Hayabusa", "Burgman 125", "Burgman 400", "Burgman 650", 
    "Intruder 125", "Intruder 250", "Yes 125", "GS 500", "Bandit 650", "Bandit 1250", "SRAD 750", "SRAD 1000", "Boulevard M800", "Boulevard M1500"
  ],
  "BMW ": [
    "R 1250 GS", "R 1300 GS", "F 850 GS", "F 750 GS", "G 310 GS", "G 310 R", "S 1000 RR", "F 800 GS", "F 800 R", "R 1200 GS", "K 1600 GTL"
  ],
  "Kawasaki": [
    "Ninja 300", "Ninja 400", "Ninja 650", "Ninja ZX-6R", "Ninja ZX-10R", "Z400", "Z650", "Z900", "Z1000", "Versys 300", "Versys 650", "Versys 1000", "Vulcan S", "Z300", "ER-6n"
  ],
  "Triumph": [
    "Tiger 900", "Tiger 800", "Tiger 1200", "Street Triple 765", "Speed Triple 1200", "Bonneville T100", "Bonneville T120", "Scrambler 900", "Scrambler 1200", "Rocket 3", "Trident 660"
  ],
  "Harley-Davidson": [
    "Iron 883", "Forty-Eight", "Fat Boy", "Heritage Classic", "Pan America", "Road King", "Street Glide", "Road Glide", "Breakout", "Fat Bob", "Low Rider S", "V-Rod", "Night Rod"
  ],
  "Royal Enfield": [
    "Meteor 350", "Classic 350", "Hunter 350", "Himalayan 411", "Scram 411", "Interceptor 650", "Continental GT 650", "Super Meteor 650"
  ],
  "Dafra": [
     "Citycom 300i", "Maxsym 400i", "Cruisym 150", "Cruisym 300", "Apache RTR 200", "NH 190", "Next 250", "Next 300", "Kansas 150", "Riva 150", "Zig 50"
  ],
  "Bajaj": [
    "Dominar 400", "Dominar 200", "Dominar 160"
  ],
  "Shineray": [
    "Rio 125", "Jef 150", "Worker 125", "Phoenix 50", "Jet 125", "XY 50"
  ],
  
  // --- CAMINHÕES ---
  "Scania": [
    "R 450", "R 540", "R 500", "R 440", "R 480", "R 620", "P 360", "P 340", "P 310", "P 250", "G 450", "G 420", "G 380", 
    "S 500", "S 540", "113 H", "113 M", "112 H", "143 H", "124 G", "124 L", "114 L"
  ],
  "Volvo ": [
    "FH 540", "FH 460", "FH 500", "FH 520", "FH 440", "FH 420", "FH 400", "FH 16", "FH 12 380", "FH 12 420", 
    "VM 270", "VM 330", "VM 260", "VM 220", "FM 370", "FM 380", "FM 460", "FMX 460", "FMX 500", "NH 12", "NL 10", "NL 12"
  ],
  "Mercedes-Benz ": [
    "Actros 2651", "Actros 2546", "Actros 2646", "Actros 4844", "Atego 2426", "Atego 1719", "Atego 2425", "Atego 3030", 
    "Accelo 1016", "Accelo 815", "Accelo 1316", "Axor 2544", "Axor 3344", "Axor 1933", "Axor 2035", "Axor 2540", 
    "L 1620", "L 1113", "L 1313", "L 1513", "LS 1935", "LS 1938", "Atron 1635", "Atron 2324"
  ],
  "Volkswagen ": [
    "Constellation 24.280", "Constellation 24.250", "Constellation 19.320", "Constellation 17.190", "Constellation 31.320", "Constellation 17.280", 
    "Delivery 11.180", "Delivery 9.170", "Delivery 6.160", "Delivery Express", "Worker 13.180", "Worker 15.180", "Worker 8.120", 
    "Meteor 28.460", "Meteor 29.520", "Titan 18.310"
  ],
  "Iveco": [
    "Stralis 460", "Stralis 440", "Stralis 380", "Hi-Way 440", "Hi-Way 480", "S-Way 480", "S-Way 540", 
    "Tector 240E28", "Tector 170E21", "Tector 9-190", "Tector 11-190", "Eurocargo", "Daily 35S14", "Daily 55C17", "Daily 70C17", "Vertis"
  ],
  "DAF": [
    "XF 105 460", "XF 105 510", "XF 480", "XF 530", "CF 85", "CF 410", "CF 450", "LF"
  ],
  "MAN": [
    "TGX 28.440", "TGX 29.440", "TGX 29.480"
  ],
  "Ford ": [
     "Cargo 2429", "Cargo 816", "Cargo 1119", "Cargo 2422", "Cargo 4532", "Cargo 1722", "F-4000", "F-350", "F-14000", "F-12000"
  ],
  "Sinotruk": [
    "A7 380", "A7 420", "Howo 380"
  ],
  
  // --- ÔNIBUS ---
  "Marcopolo": [
    "Paradiso G8 1800 DD", "Paradiso G7 1800 DD", "Paradiso 1200", "Paradiso 1050", "Paradiso 1350", 
    "Viaggio 1050", "Viaggio 900", "Torino", "Torino S", "Viale", "Viale BRT", "Ideale", "Senior", "Audace"
  ],
  "Caio": [
     "Apache Vip", "Millennium", "Millennium BRT", "Mondego", "Solar", "Foz Super", "Piccolino"
  ],
  "Busscar": [
    "Vissta Buss DD", "Vissta Buss 360", "Vissta Buss 400", "El Buss 320", "Urbanuss", "Urbanuss Pluss"
  ],
  "Agrale": [
    "Volare V8", "Volare W9", "Volare Fly 9", "Volare Fly 10", "Volare Attack 8", "MA 15.0", "MA 17.0"
  ]
};

export const YEARS = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

export const SUGGESTED_PARTS = [
  "Pastilha de Freio",
  "Amortecedor Dianteiro",
  "Kit Embreagem",
  "Óleo do Motor",
  "Filtro de Ar",
  "Bateria",
  "Pneu",
  "Correia Dentada",
  "Farol Principal",
  "Retrovisor",
  "Bomba d'água",
  "Vela de Ignição",
  "Disco de Freio",
  "Radiador",
  "Alternador",
  "Motor de Partida",
  "Coxim do Motor",
  "Junta do Cabeçote",
  "Sonda Lambda",
  "Bobina de Ignição"
];
