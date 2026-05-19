

function generateStationCode(name, city, sector) {
    const cleanName = name.substring(0, 3).toUpperCase();
    const cleanCity = city.substring(0, 3).toUpperCase();
    const cleanSector = sector.toUpperCase();
    return `${cleanName}-${cleanCity}-${cleanSector}`;

  }
  
  export default generateStationCode;