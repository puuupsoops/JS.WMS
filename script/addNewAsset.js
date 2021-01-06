const addNewAsset = function (e){

    new Promise( (res, rej) => {
        res(getDataForm());
    })
    .then( (data) => {
        const xml = new XMLHttpRequest();

        xml.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200) 
            {
                window.location.reload();
            }
            else
            {
                windows.alert('Error send data query.');
            }
        }

        sendServer(xml,data);
    });
}

const _btnAddAsset = document.getElementById("btn_accept");

if(_btnAddAsset != null)
    _btnAddAsset.addEventListener('click', addNewAsset, false);

function getValueElem(elem){//Проверка значения формы на пустоту или пробелы
    let tmp = elem.value.replace(/^\s*(.*)$/,'$1');

    if(tmp != null && tmp != ""){
        return tmp;
    }
    else
    {
        window.alert(`Заполните поле ${elem.name}`);
    }    
}

function getDataForm(){//Собираем данные с формы
    let data = {};

    data.id = getValueElem(document.getElementById("asset_id"));
    data.name = getValueElem(document.getElementById("asset_name"));
    data.descrption = getValueElem(document.getElementById("description_asset"));
    data.date = getValueElem(document.getElementById("asset_date"));
    data.cost = getValueElem(document.getElementById("asset_cost"));
    data.category = getValueElem(document.getElementById("asset_category"));
    data.type = getValueElem(document.getElementById("asset_type"));
    data.floor = getValueElem(document.getElementById("asset_floor"));
    data.location = getValueElem(document.getElementById("asset_location"));

    return data;
}

function sendServer(xml, data) {
    xml.open('POST', '/add_asset',false);
    xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xml.send(`id=${data.id}&name=${data.name}&description=${data.descrption}&date=${data.date}&cost=${data.cost}&category=${data.category}&type=${data.type}&floor=${data.floor}&location=${data.location}`);
};

console.log('addNewAsset script init');