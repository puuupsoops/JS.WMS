import {SERVER_CONFIG, DB_CONFIG, APP_CONFIG} from './config_server';
import {queryList} from './query_list';

const express = require('express');
const express_handlebars = require('express-handlebars');
const cookie_parser = require('cookie-parser');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { response } = require('express');

const indexFileView = 'index'; //главная страница
const objFileView = 'main'; //страница с выводом данных об ассете
const addAssetFileView = 'add_asset'; //страница для регистрации ассета
const responseFileWiew = 'response_file'; //файл заглушка для ответов на запросы

const hostname = SERVER_CONFIG.host;
const port = SERVER_CONFIG.port;

const _statusResponse = {
    SUCCESS: true,
    FAIL: false,
};

const _password = APP_CONFIG.adminPass; //пароль для запроса с кнопки авторизации

const _isAuthorisated = { //для куки файла авторизации
    CONFIRM: true,
    REJECT: false,
};

const pool = new Pool({ //подключение к базе данных pgsql
    user: DB_CONFIG.user,
    host: DB_CONFIG.user,
    database: DB_CONFIG.dbName,
    password: DB_CONFIG.password,
    port: 5432,
    max: 20,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 5000
});

//---------=FUNCTIONS-Expression's=---------//
const formatPSQLDataArray = function(arrData) {
    const result = [];

    for(let i = 0; i < arrData.length; i++){
        result.push({
            uid: arrData[i][Object.keys(arrData[0])[0]],
            title: arrData[i][Object.keys(arrData[0])[1]]
        });
    }

    return result;
}

//---------=END FUNCTIONS-Expression's=---------//

const cookie_liveTime = 900000;// mlsec 1 sec = 1 000 mlsec , 1 минута = 60 000 mlsec -- Время жизни куки файла, 15 минут

const server = express();

const urlencodedParser = bodyParser.urlencoded({extended: false});

const hbs = express_handlebars.create({
        layoutsDir: 'views/layouts', //директория с файлами шаблонов по умолчанию
        defaultLayout: 'layout', //файл шаблон-представления по умолчанию 
        extname: 'hbs'
});

async function server_run(){
    try{
    
        server.engine('hbs', hbs.engine);

        server.set('view engine', 'hbs');

        server.set('views', 'views'); //2 параметр ссылка на папку со страницами-шаблонами сайта

        server.use('/img', express.static(__dirname + '/img')); //директория для раздачи статических файлов с изображениями

        server.use('/icons', express.static(__dirname + '/icons')); //директория для раздачи статических файлов с иконками

        server.use('/styles', express.static(__dirname + '/styles')); //директория для раздачи статических файлов со стилями html страницы
        
        server.use('/script', express.static(__dirname + '/script')); //директория для раздачи статических файлов со скриптами

        server.use(cookie_parser()); // используем куки-парсер

        server.post("/getAssetTypeList", urlencodedParser, function (req,resp) {
            if(!req.body)
                return resp.sendStatus(400);
            
                pool.query(queryList._QueryGetAssetsTypeListString(req.body.request), (err,response) => {
                    if(response.rows != undefined && response.rows != null)
                        resp.send(formatPSQLDataArray(response.rows));
                });
        });

        server.post("/getLocationsList", urlencodedParser, function (req,resp) {
            if(!req.body)
                return resp.sendStatus(400);
            
                pool.query(queryList._QueryGetRoomsListString(req.body.request), (err,response) => {
                    if(response.rows != undefined && response.rows != null)
                        resp.send(formatPSQLDataArray(response.rows));
                });
        });

        server.post("/add_asset", urlencodedParser, function (req, resp){//для регистрации ассета (получаем данные с формы)
            if(!req.body)
                return resp.sendStatus(400);

            pool.query(queryList._QueryInsertAsset(req.body), (err, response) => {
                if(err){
                    resp.sendStatus(500);
                }
                if(response){
                    resp.sendStatus(200);
                }
            });  
            /*resp.render(responseFileWiew, {
                _status: _statusResponse.SUCCESS,
            });*/    
        });

        server.post("/authorisation", urlencodedParser, function (req, resp) {
            console.log(req.body.password); 
            if(!req.body)
                return resp.sendStatus(400);
            if(req.body.password == _password)
                {
                 resp.cookie('isAuthorisated', _isAuthorisated.CONFIRM, { expires: new Date(Date.now() + cookie_liveTime), httpOnly: true});
                 resp.sendStatus(200);
                }
                else {resp.sendStatus(504)}
        });

        server.get("/", function(req,resp){

            const obj_id = splitString(req.url,"?id="); //получаем номер id из url запроса /?id=xxxxxxxxx

                if(req.cookies['isAuthorisated'] === undefined)
                       resp.cookie('isAuthorisated', _isAuthorisated.REJECT, { expires: new Date(Date.now() + cookie_liveTime), httpOnly: true}); //создаем куки

                       if(req.url == '/' ) 
                       { 
                           console.log('empty url id');

                           if(req.cookies['isAuthorisated'] == _isAuthorisated.CONFIRM.toString())
                           {    //сбор данных для Главной - Информационной страницы
                                const offices = [];
                                //! разместить цикл для получения списка оффисов !//
                                const result = {};
                                pool.query(queryList._QueryGetAllCountActiveAssets())
                                .then(res => {
                                    result.activeAssets = res.rowCount.toString();

                                            pool.query(queryList._QueryGetAllCountEmployees())
                                            .then( res => {
                                                result.employeesCount = res.rowCount.toString();

                                                    pool.query(queryList._QueryGetOfficeInfo())
                                                    .then( async res => {
                                                        const data = res.rows[0];
                                                        result.uid = data.o_uid;
                                                        result.alias = data.o_alias;
                                                        result.address = `${data.o_city}, ул.${data.o_street}, д.${data.o_building}, стр.${data.o_structure}, п.${data.o_porch}, кв.${data.o_flat}`;

                                                        return await new Promise ((resolve,reject) => {
                                                            offices.push(result);
                                                            resolve(offices);
                                                        })
                                                        .then( data => {
                                                            resp.render(indexFileView, {
                                                                _office: data,
                                                                _isAdmin: isAdmin(req)
                                                            });
                                                        });
                                                    });
                                            });
                                });
                            }
                            else
                            {
                                resp.render(indexFileView, {
                                    _isAdmin: isAdmin(req)
                                });
                            }
                       }
                       else
                       {

                        pool.connect()
                            .then( () => {
                                pool.query(queryList._QueryGetAssetByIDString(obj_id), (err,res) => {

                                    if(res.rows[0] != undefined){
                                        try {
                                            console.log(res.rows[0]); 

                                            const current_date = new Date();

                                            resp.render(objFileView, {//отображаем данные в шаблоне
                                                object_id: res.rows[0].a_uid,
                                                object_name: res.rows[0].a_name,
                                                object_description: res.rows[0].a_description,
                                                object_start_use_data: `${res.rows[0].a_start_use.getDate()}.${res.rows[0].a_start_use.getMonth() + 1}.${res.rows[0].a_start_use.getFullYear()}`,
                                                object_cost: res.rows[0].a_cost,
                                                object_type: res.rows[0].t_title,
                                                object_room: res.rows[0].r_title,
                                                object_class: res.rows[0].c_title,
                                                object_location: res.rows[0].l_title,
                                                object_image_path: res.rows[0].i_path,
                                                object_in_work: ((current_date - res.rows[0].a_start_use)/1000/60/60/24).toFixed(0),
                                                _isAdmin: isAdmin(req)
 
                                            }); 
                                            }
                                        catch 
                                            {
                                                (e) => {console.log(e);}
                                            }
                                    }
                                    else
                                    {
                                        //если id ассета не найдено, рендерится страница с функциями добавления в базу данных
                                        console.log('unregister asset');

                                       pool.query(queryList._QueryGetCategoriesList(),(err,response) => { 
                                            const category = response.rows;

                                            pool.query(queryList._QueryGetLocationList(),(err,res) => {
                                                resp.render(addAssetFileView, {
                                                        
                                                        asset_id: obj_id,
                                                        category: category,
                                                        location: res.rows,
                                                        _isAdmin: isAdmin(req),
                                                });
                                                //pool.end(); // закрываем пул соединения с БД (закрывает всё соединение с бд, вызовет ошибку при попытке использовать пулл после закрытия)
                                            });
                                        });
                                    
                                    }
                                
                                });
                            });
                        }           
        });
            
        server.listen(port,hostname, ()=>{
            console.log(`Server started at http://${hostname}:${port}/`);
        });

    } 
    catch (e)
    {   
        console.log(e); 
    }
};

function splitString(urlStringSplit,separator){ //функция для получения id из url-search
    let id = urlStringSplit.split(separator);
    return id[1];
}
function isAdmin(req) {
    if(req.cookies['isAuthorisated'] === undefined || req.cookies['isAuthorisated'] == 'false') 
    {
        return false
    } 
    else 
    {
        return true
    };
}

//----------=START SERVER=----------//

server_run();