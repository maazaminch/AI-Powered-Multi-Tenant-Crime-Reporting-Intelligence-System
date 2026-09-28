

function generateStationCode(name, city, sector) {
    const cleanName = name.substring(0, 3).toUpperCase();
    const cleanCity = city.substring(0, 3).toUpperCase();
    const cleanSector = sector ? sector.substring(0, 3).toUpperCase() : 'GEN';

    if(cleanSector){
        return `${cleanName}-${cleanCity}-${cleanSector}`;
    }
    
    return `${cleanName}-${cleanCity}`;
}

export default generateStationCode;