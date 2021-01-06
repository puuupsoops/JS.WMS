
const getPassword = function () {
    new Promise ( (res, rej) => {
        res(prompt('Введите пароль',''));
    })
    .then(data => {
        //console.log(data);
        const xml = new XMLHttpRequest();

        xml.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200) 
            {
                window.location.reload();
            }
            else
            {

            }
        }

        sendServer(xml,data);
    })
};

const _btnAuthorization =  document.getElementById("btnAuthorization");

if(_btnAuthorization != null)
_btnAuthorization.addEventListener('click', getPassword);

function sendServer(xml, data) {
    xml.open('POST', '/authorisation',true);
    xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xml.send(`password=${data}`);
};

console.log('authorization script init');