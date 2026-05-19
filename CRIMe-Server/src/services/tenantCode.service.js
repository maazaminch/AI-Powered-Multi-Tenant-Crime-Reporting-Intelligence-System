
function generateTenantCode(name, region) {
    const cleanName = name.replace(/\s+/g, "").toUpperCase();
    const cleanRegion = region.substring(0,3).toUpperCase();
    return `${cleanName}-${cleanRegion}`;

  }
  
  export default generateTenantCode;