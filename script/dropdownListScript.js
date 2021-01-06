const xhttp = new XMLHttpRequest();

const _assetCategory = document.getElementById("asset_category");
const _assetType = document.getElementById("asset_type");
const _assetFloor = document.getElementById("asset_floor");
const _assetLocation = document.getElementById("asset_location");

const routersGetRequests = {
    assetCategory: "getAssetCategoriesList",
    assetType: "getAssetTypeList",
    assetFloor: "getFloorList",
    assetLocation: "getLocationsList"
}

if(_assetFloor != null)
    _assetFloor.addEventListener('change', () => {getData(_assetFloor.value,routersGetRequests.assetLocation,_assetLocation)});
    
if(_assetCategory != null)
    _assetCategory.addEventListener('change', () => {getData(_assetCategory.value,routersGetRequests.assetType,_assetType)});

const getData = function(requireWord, route, placeholder) {
    new Promise( (res,rej)=>{
        
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                return JSON.parse(this.response);
            }
            else
            {

            }
        };

        xhttp.open('POST',`/${route}`,false);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(`request=${requireWord}`);
        res(xhttp.onreadystatechange());
    })
    .then( (data) => { setValues(data,placeholder); });
};

const setValues = function(data,placeholder) {
    placeholder.length = 0;

    if(data != undefined && data != null)
    {
        data.forEach(element => {
            if(element != null)
                placeholder.add(new Option(element.title,element.uid));
        });
    }
}

getData(_assetFloor.value,routersGetRequests.assetLocation,_assetLocation);
getData(_assetCategory.value,routersGetRequests.assetType,_assetType);