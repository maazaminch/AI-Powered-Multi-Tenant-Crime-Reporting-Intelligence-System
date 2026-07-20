//======================================================
// IMPORTS
//======================================================

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import connectDB from "../src/config/db.js";

import User from "../src/models/user.model.js";
import Tenant from "../src/models/tenant.model.js";
import PoliceStation from "../src/models/policeStation.model.js";
import Case from "../src/models/case.model.js";



//======================================================
// CONSTANTS
//======================================================


const PASSWORD = "12345678";

const TOTAL_CITIZENS = 100;

const TOTAL_CASES_PER_STATION = 5;

const CITIZEN_CASES_PER_STATION = 2;

const GUEST_CASES_PER_STATION = 3;



//======================================================
// TENANTS
//======================================================


const TENANTS = [
    {
        name: "Lahore",
        region: "Punjab",
        type: "CITY",
    },

    {
        name: "Karachi",
        region: "Sindh",
        type: "CITY",
    },

    {
        name: "Islamabad",
        region: "Islamabad Capital Territory",
        type: "CITY",
    },

    {
        name: "Peshawar",
        region: "Khyber Pakhtunkhwa",
        type: "CITY",
    },

    {
        name: "Quetta",
        region: "Balochistan",
        type: "CITY",
    },

];



//======================================================
// POLICE STATIONS
//======================================================


const STATIONS = {

    Lahore: [

        "Johar Town",
        "Model Town",
        "Shalimar",
        "Cantt",
        "Iqbal Town"

    ],

    Karachi: [

        "Clifton",
        "Defence",
        "Saddar",
        "Nazimabad",
        "Gulshan e Iqbal"

    ],

    Islamabad: [

        "Margalla",
        "Golra",
        "Industrial Area",
        "Ramna",
        "Sabzi Mandi"

    ],

    Peshawar: [

        "Hayatabad",
        "Town",
        "Faqirabad",
        "Warsak",
        "Kohat Road"

    ],

    Quetta: [

        "Sariab",
        "Cantt",
        "Civil Lines",
        "Satellite Town",
        "Brewery"

    ]

};



//======================================================
// STATION COORDINATES
//======================================================


const STATION_COORDINATES = {

    Lahore: [
        { latitude: 31.475, longitude: 74.395, address: "Johar Town, Lahore" },
        { latitude: 31.515, longitude: 74.345, address: "Model Town, Lahore" },
        { latitude: 31.565, longitude: 74.395, address: "Shalimar, Lahore" },
        { latitude: 31.545, longitude: 74.415, address: "Cantt, Lahore" },
        { latitude: 31.525, longitude: 74.325, address: "Iqbal Town, Lahore" }
    ],

    Karachi: [
        { latitude: 24.815, longitude: 67.035, address: "Clifton, Karachi" },
        { latitude: 24.795, longitude: 67.065, address: "Defence, Karachi" },
        { latitude: 24.855, longitude: 67.005, address: "Saddar, Karachi" },
        { latitude: 24.915, longitude: 67.025, address: "Nazimabad, Karachi" },
        { latitude: 24.935, longitude: 67.115, address: "Gulshan e Iqbal, Karachi" }
    ],

    Islamabad: [
        { latitude: 33.715, longitude: 73.045, address: "Margalla, Islamabad" },
        { latitude: 33.665, longitude: 72.995, address: "Golra, Islamabad" },
        { latitude: 33.635, longitude: 73.075, address: "Industrial Area, Islamabad" },
        { latitude: 33.695, longitude: 73.025, address: "Ramna, Islamabad" },
        { latitude: 33.655, longitude: 73.095, address: "Sabzi Mandi, Islamabad" }
    ],

    Peshawar: [
        { latitude: 34.015, longitude: 71.785, address: "Hayatabad, Peshawar" },
        { latitude: 34.025, longitude: 71.565, address: "Town, Peshawar" },
        { latitude: 34.005, longitude: 71.535, address: "Faqirabad, Peshawar" },
        { latitude: 34.045, longitude: 71.625, address: "Warsak, Peshawar" },
        { latitude: 34.035, longitude: 71.515, address: "Kohat Road, Peshawar" }
    ],

    Quetta: [
        { latitude: 30.195, longitude: 66.975, address: "Sariab, Quetta" },
        { latitude: 30.215, longitude: 66.995, address: "Cantt, Quetta" },
        { latitude: 30.185, longitude: 67.005, address: "Civil Lines, Quetta" },
        { latitude: 30.175, longitude: 66.955, address: "Satellite Town, Quetta" },
        { latitude: 30.165, longitude: 66.935, address: "Brewery, Quetta" }
    ]

};



//======================================================
// GENDERS
//======================================================


const GENDERS = [

    "MALE",
    "FEMALE"

];



//======================================================
// ID TYPES
//======================================================


const ID_TYPES = [

    "NATIONAL_ID"

];




//======================================================
// CRIME TYPES
//======================================================


const CRIME_TYPES = [

    "THEFT",
    "ROBBERY",
    "ASSAULT",
    "MURDER",
    "DOMESTIC_VIOLENCE",
    "CYBER_CRIME",
    "KIDNAPPING",
    "FRAUD",
    "DRUG_OFFENSE",
    "HARASSMENT",
    "TRAFFIC_VIOLATION"

];




//======================================================
// SEVERITY MAPPING
//======================================================


const SEVERITY_MAPPING = {


    THEFT: [

        "LOW",
        "MEDIUM"

    ],

    ROBBERY: [

        "MEDIUM",
        "HIGH"

    ],

    ASSAULT: [

        "MEDIUM",
        "HIGH"

    ],

    MURDER: [

        "HIGH",
        "CRITICAL"

    ],

    DOMESTIC_VIOLENCE: [

        "HIGH"

    ],

    CYBER_CRIME: [

        "MEDIUM",
        "HIGH"

    ],

    KIDNAPPING: [

        "HIGH",
        "CRITICAL"

    ],

    FRAUD: [

        "MEDIUM",
        "HIGH"

    ],

    DRUG_OFFENSE: [

        "HIGH"

    ],

    HARASSMENT: [

        "MEDIUM"

    ],

    TRAFFIC_VIOLATION: [

        "LOW"

    ]


};



//======================================================
// UTILITIES
//======================================================



const getRandomItem = (array) => {

    return array[Math.floor(Math.random() * array.length)];

};



const generateRandomAge = (min, max) => {

    return Math.floor(

        Math.random() * (max - min + 1)

    ) + min;

};



const generateDOB = (age) => {

    const today = new Date();

    const year = today.getFullYear() - age;

    const month = Math.floor(Math.random() * 12);

    const day = Math.floor(Math.random() * 28) + 1;

    return new Date(year, month, day);

};



const generatePhoneNumber = () => {

    const number = Math.floor(

        10000000 + Math.random() * 90000000

    );

    return `03${number}`;

};



let NATIONAL_ID_COUNTER = 3520200000001;


const generateNationalId = () => {

    NATIONAL_ID_COUNTER++;

    return String(NATIONAL_ID_COUNTER);

};



const getRandomCoordinates = (
    latitude,
    longitude
) => {

    const latOffset = (Math.random() - 0.5) / 500;

    const lngOffset = (Math.random() - 0.5) / 500;


    return [

        longitude + lngOffset,
        latitude + latOffset

    ];

};



const capitalize = (value) => {

    return value.charAt(0).toUpperCase() +
        value.slice(1).toLowerCase();

};


//======================================================
// PAKISTANI NAMES DATASET
//======================================================


const MALE_FIRST_NAMES = [

    "Muhammad",
    "Ahmed",
    "Ali",
    "Abdullah",
    "Hamza",
    "Hassan",
    "Hussain",
    "Usman",
    "Bilal",
    "Talha",
    "Umar",
    "Saad",
    "Zain",
    "Ammar",
    "Shayan",
    "Ayan",
    "Khizar",
    "Daniyal",
    "Farhan",
    "Maaz"

];


const FEMALE_FIRST_NAMES = [

    "Ayesha",
    "Fatima",
    "Noor",
    "Hafsa",
    "Maham",
    "Maryam",
    "Amna",
    "Iqra",
    "Zara",
    "Sana",
    "Hina",
    "Aleena",
    "Anaya",
    "Areeba",
    "Komal",
    "Laiba",
    "Sahar",
    "Sidra",
    "Eman",
    "Mehwish"

];


const LAST_NAMES = [

    "Khan",
    "Ahmed",
    "Ali",
    "Malik",
    "Sheikh",
    "Chaudhary",
    "Butt",
    "Rajput",
    "Raza",
    "Hashmi",
    "Baig",
    "Shah",
    "Mirza",
    "Ansari",
    "Qureshi",
    "Siddiqui",
    "Farooq",
    "Akram",
    "Yousaf",
    "Hassan"

];



//======================================================
// USER HELPERS
//======================================================


const generateFullName = (gender) => {

    if (gender === "MALE") {

        return `${getRandomItem(MALE_FIRST_NAMES)}
        ${getRandomItem(LAST_NAMES)}`;

    }


    return `${getRandomItem(FEMALE_FIRST_NAMES)}
    ${getRandomItem(LAST_NAMES)}`;


};



const generateEmail = (fullName, prefix) => {

    const randomNumber =
        Math.floor(Math.random() * 10000);


    const formattedName = fullName
        .toLowerCase()
        .replaceAll(" ", ".");


    return `${prefix}.${formattedName}.${randomNumber}@gmail.com`;

};



//======================================================
// GLOBAL ARRAYS
//======================================================


const CREATED_TENANTS = [];

const CREATED_ADMINS = [];

const CREATED_CITIZENS = [];

const CREATED_STATIONS = [];

const CREATED_POLICE = [];

const CREATED_CASES = [];




//======================================================
// MULTAN TENANT
//======================================================


const getExistingMultanTenant = async () => {

    const tenant = await Tenant.findOne({

        name: "Multan"

    });


    if (!tenant) {

        throw new Error(

            "Multan tenant does not exist."

        );

    }


    console.log(
        "Existing Tenant Found -> Multan"
    );


    return tenant;

};




//======================================================
// CREATE TENANTS
//======================================================


const createTenants = async () => {

    console.log("\nCreating Tenants....\n");


    for (const tenant of TENANTS) {


        const alreadyExists =
            await Tenant.findOne({

                name: tenant.name

            });



        if (alreadyExists) {

            console.log(

                `${tenant.name} already exists. Skipping....`

            );


            CREATED_TENANTS.push(

                alreadyExists

            );

            continue;

        }


        const newTenant =
            await Tenant.create({

                name: tenant.name,

                region: tenant.region,

                type: tenant.type

            });



        CREATED_TENANTS.push(

            newTenant

        );


        console.log(

            `${tenant.name} created successfully.`

        );

    }


    console.log("\nTenants Created Successfully.\n");

};




//======================================================
// CREATE ADMINS
//======================================================



const createAdmins = async () => {


    console.log("\nCreating Admins....\n");


    for (const tenant of CREATED_TENANTS) {


        for (let i = 1; i <= 2; i++) {


            const gender =
                getRandomItem(GENDERS);


            const age =
                generateRandomAge(30, 45);


            const fullName =
                generateFullName(gender);


            const email =

                `admin${i}.${tenant.name.toLowerCase()}@gmail.com`;

            const hashedPassword = await bcrypt.hash(PASSWORD, 10);
            const hashedNationalId = await bcrypt.hash(generateNationalId(), 10);

            const admin =
                await User.create({

                    tenantId: tenant._id,

                    fullName,

                    email,

                    password: hashedPassword,

                    phone:
                        generatePhoneNumber(),

                    gender,

                    role: "ADMIN",

                    status: "APPROVED",

                    dateOfBirth:
                        generateDOB(age),

                    idType: "NATIONAL_ID",

                    nationalIdHash:
                        hashedNationalId,

                    address:
                        `${tenant.name}, Pakistan`

                });



            CREATED_ADMINS.push(

                admin

            );


            console.log(

                `${email} created successfully.`

            );


        }


    }


    console.log(

        "\nAdmins Created Successfully.\n"

    );


};


//======================================================
// CREATE CITIZENS
//======================================================


const createCitizens = async () => {


    console.log("\nCreating Citizens....\n");


    for (let i = 1; i <= TOTAL_CITIZENS; i++) {


        const gender =
            getRandomItem(GENDERS);


        const age =
            generateRandomAge(18, 60);


        const fullName =
            generateFullName(gender);


        const email =
            generateEmail(

                fullName,
                "citizen"

            );

        const hashedPassword = await bcrypt.hash(PASSWORD, 10);
        const hashedNationalId = await bcrypt.hash(generateNationalId(), 10);

        const citizen =
            await User.create({

                fullName,

                email,

                password: hashedPassword,

                phone:
                    generatePhoneNumber(),

                gender,

                role: "CITIZEN",

                status: "APPROVED",

                dateOfBirth:
                    generateDOB(age),

                idType:
                    "NATIONAL_ID",

                nationalIdHash:
                    hashedNationalId,

                address:
                    "Pakistan"

            });



        CREATED_CITIZENS.push(

            citizen

        );


        console.log(

            `Citizen ${i} Created.`

        );



    }



    console.log(

        "\n100 Citizens Created Successfully.\n"

    );


};




//======================================================
// CITIZEN HELPERS
//======================================================



const getRandomCitizen = () => {

    return getRandomItem(

        CREATED_CITIZENS

    );

};



const getCitizenReporter = () => {


    const citizen =
        getRandomCitizen();



    return {

        type: "CITIZEN",

        citizenId:
            citizen._id,

        name:
            citizen.fullName,

        email:
            citizen.email,

        phone:
            citizen.phone

    };


};



const getGuestReporter = () => {


    const gender =
        getRandomItem(

            GENDERS

        );


    const fullName =
        generateFullName(

            gender

        );



    return {


        type: "GUEST",

        citizenId: null,

        name:
            fullName,

        email:

            generateEmail(

                fullName,
                "guest"

            ),

        phone:

            generatePhoneNumber()


    };


};




//======================================================
// TENANT HELPERS
//======================================================


const getTenantByName = (name) => {

    return CREATED_TENANTS.find(

        (tenant) =>

            tenant.name === name

    );


};



const getAdminsByTenant = (tenantId) => {


    return CREATED_ADMINS.filter(

        (admin) =>

            String(admin.tenantId) ===
            String(tenantId)

    );


};


//======================================================
// GLOBAL POLICE COUNTER
//======================================================


let POLICE_COUNTER = 1;



//======================================================
// POLICE HELPERS
//======================================================



const generateBadgeNumber = (city) => {


    const cityCode = city
        .substring(0, 3)
        .toUpperCase();


    const badgeNumber =

        String(POLICE_COUNTER++)
        .padStart(3, "0");


    return `POL-${cityCode}-${badgeNumber}`;


};




const generatePoliceEmail = (

    city,
    station,
    number

) => {


    const formattedCity =

        city
        .toLowerCase()
        .replaceAll(" ", "");


    const formattedStation =

        station
        .toLowerCase()
        .replaceAll(" ", "");



    return `police${number}.${formattedStation}.${formattedCity}@gmail.com`;


};



const generateSHOEmail = (

    city,
    station

) => {


    const formattedCity =

        city
        .toLowerCase()
        .replaceAll(" ", "");


    const formattedStation =

        station
        .toLowerCase()
        .replaceAll(" ", "");



    return `sho.${formattedStation}.${formattedCity}@gmail.com`;


};




//======================================================
// STATION HELPERS
//======================================================



const getStationCoordinates = (

    city,
    index

) => {


    return STATION_COORDINATES
        [city][index];


};




const getStationsByTenant = (

    tenantId

) => {


    return CREATED_STATIONS.filter(

        (station) =>

            String(
                station.tenantId
            )

            ===

            String(
                tenantId
            )

    );


};




//======================================================
// CREATE POLICE STATIONS
//======================================================


const createPoliceStations = async () => {


    console.log(

        "\nCreating Police Stations....\n"

    );


    for (const tenant of CREATED_TENANTS) {


        const stationNames =

            STATIONS[
            tenant.name
            ];


        for (

            let i = 0;
            i < stationNames.length;
            i++

        ) {


            const stationName =

                stationNames[i];



            const coordinates =

                getStationCoordinates(

                    tenant.name,
                    i

                );



            const station =

                await PoliceStation.create({

                    tenantId:
                        tenant._id,


                    name:
                        stationName,


                    address:
                        coordinates.address,


                    locationLabel:
                        coordinates.address,


                    city:
                        tenant.name,


                    sector:
                        stationName,


                    contactNumber:
                        generatePhoneNumber(),


                    email:

                        `${stationName
                            .replaceAll(" ", "")
                            .toLowerCase()}.${tenant.name
                                .toLowerCase()}@gmail.com`,


                    location: {

                        type: "Point",

                        coordinates: [

                            coordinates.longitude,

                            coordinates.latitude

                        ]

                    },


                    isActive: true

                });



            CREATED_STATIONS.push(

                station

            );



            console.log(

                `${station.name}
                 (${tenant.name})
                  created.`

            );


        }



    }



    console.log(

        "\n25 Police Stations Created Successfully.\n"

    );


};


//======================================================
// POLICE HELPERS
//======================================================


const getPoliceByStation = (stationId) => {

    return CREATED_POLICE.filter(

        (police) =>

            String(police.policeStationId) ===
            String(stationId)

    );

};



const getSHOByStation = (stationId) => {

    return CREATED_POLICE.find(

        (police) =>

            String(police.policeStationId) ===
            String(stationId)

            &&

            police.isStationHead === true

    );

};




//======================================================
// CREATE POLICE OFFICERS
//======================================================



const createPoliceOfficers = async () => {


    console.log(

        "\nCreating Police Officers.....\n"

    );


    for (const station of CREATED_STATIONS) {


        const tenant = await Tenant.findById(

            station.tenantId

        );


        const stationName =

            station.name;


        const cityName =

            tenant.name;



        for (let i = 1; i <= 5; i++) {


            const isSHO = i === 1;


            const gender =
                getRandomItem(

                    GENDERS

                );


            const age =
                generateRandomAge(

                    28,
                    55

                );


            const fullName =
                generateFullName(

                    gender

                );



            const email =

                isSHO

                ?

                generateSHOEmail(

                    cityName,
                    stationName

                )

                :

                generatePoliceEmail(

                    cityName,
                    stationName,
                    i

                );

            const hashedPassword = await bcrypt.hash(PASSWORD, 10);
            const hashedNationalId = await bcrypt.hash(generateNationalId(), 10);

            const policeOfficer =

                await User.create({

                    tenantId:
                        tenant._id,


                    fullName,

                    email,

                    password:
                        hashedPassword,


                    phone:
                        generatePhoneNumber(),


                    gender,


                    role:
                        "POLICE",


                    status:
                        "APPROVED",


                    badgeNumber:

                        generateBadgeNumber(

                            cityName

                        ),


                    policeStationId:
                        station._id,


                    isStationHead:
                        isSHO,


                    dateOfBirth:

                        generateDOB(

                            age

                        ),


                    idType:
                        "NATIONAL_ID",


                    nationalIdHash:

                        hashedNationalId,


                    address:

                        `${cityName},
                        Pakistan`

                });



            CREATED_POLICE.push(

                policeOfficer

            );



            console.log(

                `${email} created.`

            );


        }


    }



    console.log(

        "\nPolice Officers Created Successfully.\n"

    );


};




//======================================================
// UPDATE STATION HEAD
//======================================================



const updateStationHeads = async () => {


    console.log(

        "\nUpdating Station Heads....\n"

    );


    for (

        const station of CREATED_STATIONS

    ) {


        const sho =

            getSHOByStation(

                station._id

            );



        if (!sho) {


            continue;

        }



        station.stationHead =

            sho._id;



        await station.save();



        console.log(

            `${station.name}
            updated successfully.`

        );


    }


    console.log(

        "\nAll Station Heads Updated.\n"

    );


};


//======================================================
// CRIME DESCRIPTIONS
//======================================================


const CRIME_DESCRIPTIONS = {


    THEFT: [

        "My motorcycle was parked outside the market and was stolen by unknown persons.",

        "My mobile phone was stolen while travelling in public transport.",

        "Unknown individuals broke the lock of my house and stole valuable items."

    ],


    ROBBERY: [

        "Two armed individuals stopped me and took my wallet and mobile phone.",

        "Unknown suspects robbed my shop and escaped with cash.",

        "The accused threatened me with a weapon and stole my belongings."

    ],


    ASSAULT: [

        "I was physically assaulted during an argument near my residence.",

        "Unknown individuals attacked me causing minor injuries.",

        "The accused assaulted me over a personal dispute."

    ],


    MURDER: [

        "The victim was attacked by unknown persons resulting in death.",

        "A serious incident of intentional murder has been reported.",

        "The deceased suffered fatal injuries during the attack."

    ],


    DOMESTIC_VIOLENCE: [

        "The victim has reported repeated domestic violence and physical abuse.",

        "The complainant has suffered harassment and violence at home.",

        "Domestic abuse has been reported by the victim."

    ],


    CYBER_CRIME: [

        "The complainant became the victim of an online financial scam.",

        "Unauthorized access was gained to the complainant's social media account.",

        "Sensitive information was stolen through a phishing attack."

    ],


    KIDNAPPING: [

        "The victim has been reported missing after being abducted by unknown persons.",

        "The complainant alleges that the accused kidnapped a family member.",

        "A kidnapping incident has been reported requiring immediate investigation."

    ],


    FRAUD: [

        "The complainant was deceived during an online transaction.",

        "The accused obtained money through fraudulent means.",

        "A financial fraud involving fake documentation has been reported."

    ],


    DRUG_OFFENSE: [

        "Illegal narcotics were recovered from the accused.",

        "Drug trafficking activities have been reported in the area.",

        "Possession of prohibited substances has been reported."

    ],


    HARASSMENT: [

        "The complainant has reported continuous harassment.",

        "The victim has been threatened repeatedly by the accused.",

        "Unwanted behaviour causing mental distress has been reported."

    ],


    TRAFFIC_VIOLATION: [

        "A serious traffic violation causing public inconvenience has been reported.",

        "Dangerous driving was observed on the main road.",

        "The accused violated traffic regulations resulting in an accident."

    ]


};




//======================================================
// CASE HELPERS
//======================================================



const getRandomCrimeType = () => {


    return getRandomItem(

        CRIME_TYPES

    );


};



const getSeverity = (crimeType) => {


    return getRandomItem(

        SEVERITY_MAPPING[
            crimeType
        ]

    );


};



const getCrimeDescription = (

    crimeType

) => {


    return getRandomItem(

        CRIME_DESCRIPTIONS[
            crimeType
        ]

    );


};



const getRandomCaseCoordinates = (

    station

) => {


    const latitude =

        station.location
        .coordinates[1];


    const longitude =

        station.location
        .coordinates[0];



    return getRandomCoordinates(

        latitude,
        longitude

    );


};




//======================================================
// CREATE CASES
//======================================================


const createCases = async () => {


    console.log(

        "\nCreating Cases.....\n"

    );


    for (

        const station of CREATED_STATIONS

    ) {


        for (

            let i = 1;
            i <= TOTAL_CASES_PER_STATION;
            i++

        ) {


            const crimeType =

                getRandomCrimeType();



            const severity =

                getSeverity(

                    crimeType

                );



            const description =

                getCrimeDescription(

                    crimeType

                );



            const coordinates =

                getRandomCaseCoordinates(

                    station

                );



            const reporter =

                i <=
                CITIZEN_CASES_PER_STATION

                ?

                getCitizenReporter()

                :

                getGuestReporter();



            const policeCase =

                await Case.create({


                    tenantId:
                        station.tenantId,


                    reporter,


                    crimeType,


                    severity,


                    description,


                    status:
                        "PENDING",


                    assignedTo:
                        null,


                    assignedBy:
                        null,


                    policeStationId:
                        station._id,


                    location: {

                        type: "Point",

                        coordinates

                    },


                    addressText:
                        station.address


                });



            CREATED_CASES.push(

                policeCase

            );



            console.log(

                `${crimeType}
                case created.`

            );


        }


    }



    console.log(

        "\nCases Created Successfully.\n"

    );


};


//======================================================
// SUMMARY
//======================================================


const printSummary = () => {


    const totalSHO = CREATED_POLICE.filter(

        (police) =>

            police.isStationHead === true

    ).length;



    const citizenCases = CREATED_CASES.filter(

        (policeCase) =>

            policeCase.reporter.type ===
            "CITIZEN"

    ).length;



    const guestCases = CREATED_CASES.filter(

        (policeCase) =>

            policeCase.reporter.type ===
            "GUEST"

    ).length;



    console.log("\n");


    console.log(
        "================================================="
    );

    console.log(
        "SEED COMPLETED SUCCESSFULLY"
    );

    console.log(
        "================================================="
    );


    console.log(

        `\nTenants               : ${CREATED_TENANTS.length}`

    );


    console.log(

        `Admins                : ${CREATED_ADMINS.length}`

    );


    console.log(

        `Citizens              : ${CREATED_CITIZENS.length}`

    );


    console.log(

        `Police Stations       : ${CREATED_STATIONS.length}`

    );


    console.log(

        `Police Officers       : ${CREATED_POLICE.length}`

    );


    console.log(

        `SHO                   : ${totalSHO}`

    );


    console.log(

        `Cases                 : ${CREATED_CASES.length}`

    );


    console.log(

        `Citizen Cases         : ${citizenCases}`

    );


    console.log(

        `Guest Cases           : ${guestCases}`

    );


    console.log(
        "=================================================\n"
    );


};




//======================================================
// SEED DATABASE
//======================================================


const seedDatabase = async () => {


    try {


        console.log("\n");


        console.log(
            "================================================="
        );


        console.log(
            "CRIME REPORTING SYSTEM SEED SCRIPT"
        );


        console.log(
            "=================================================\n"
        );



        // EXISTING TENANT

        await getExistingMultanTenant();



        // TENANTS

        await createTenants();



        // ADMINS

        await createAdmins();



        // CITIZENS

        await createCitizens();



        // POLICE STATIONS

        await createPoliceStations();



        // POLICE OFFICERS

        await createPoliceOfficers();



        // UPDATE STATION HEADS

        await updateStationHeads();



        // CASES

        await createCases();



        // PRINT SUMMARY

        printSummary();


    }


    catch (error) {


        console.log(

            "\nSEED FAILED.\n"

        );


        console.error(

            error

        );


    }


};




//======================================================
// MAIN FUNCTION
//======================================================



const main = async () => {


    try {


        await connectDB();


        console.log(

            "\nDatabase Connected Successfully.\n"

        );


        await seedDatabase();



        await mongoose.connection.close();



        console.log(

            "\nDatabase Connection Closed.\n"

        );


    }


    catch (error) {


        console.error(

            "\nSomething went wrong.\n"

        );


        console.error(

            error

        );


        await mongoose.connection.close();


    }


};



main();


