function QueryGetRoomsListString(searchIndex) {
    return `SELECT r_uid,r_title FROM rooms_list WHERE r_location = ${searchIndex}`;
};

function QueryGetAssetsTypeListString(searchIndex) {
    return `SELECT t_uid,t_title FROM type_list WHERE t_category = ${searchIndex}`;

};

function QueryGetAssetByIDString(serachId){
    return `SELECT a_uid, a_name, a_description, a_start_use, a_cost, t_title, r_title, c_title, l_title, i_path FROM assets 
                INNER JOIN type_list on assets.a_type = type_list.t_uid 
                    INNER JOIN rooms_list on assets.a_location = rooms_list.r_uid
                        INNER JOIN categories_list on type_list.t_category = categories_list.c_uid
                            INNER JOIN location_list on rooms_list.r_location = location_list.l_uid
                                INNER JOIN images_list on assets.a_image_source = images_list.i_uid
                                    WHERE assets.a_id = ${serachId}`;
};

function QueryGetAllCountEmployees(office_id = 1) {
    return `SELECT s_uid FROM id_cards WHERE s_current_office = ${office_id}`;
};

function QueryGetAllCountActiveAssets(office_id = 1) {
    return `SELECT * FROM assets WHERE a_onbalance = true AND a_current_office = ${office_id}`;
};

//Query Full data rows//

function QueryGetEmployees() {
    return `SELECT * FROM id_cards`;
};

function QueryGetLocationList() {
    return `SELECT * FROM location_list`;
};

function QueryGetCategoriesList() {
    return `SELECT * FROM categories_list`;
};

function QueryGetOfficeInfo(office_id = 1) {
    return `SELECT * FROM offices WHERE o_uid = ${office_id}`;
};

function QueryGetAllAssetsList() {
    return `SELECT a_uid, a_name, a_description, a_start_use, a_cost, t_title, r_title, c_title, l_title, i_path FROM assets 
                INNER JOIN type_list on assets.a_type = type_list.t_uid 
                    INNER JOIN rooms_list on assets.a_location = rooms_list.r_uid
                        INNER JOIN categories_list on type_list.t_category = categories_list.c_uid
                            INNER JOIN location_list on rooms_list.r_location = location_list.l_uid
                                INNER JOIN images_list on assets.a_image_source = images_list.i_uid`;                                   
};

//Querys INSERT//

function QueryInsertAsset(data) {
    return `INSERT INTO assets(a_id, a_name, a_description, a_start_use, a_cost, a_type, a_location, a_owner, a_onbalance, a_image_source)
                VALUES(${data.id},'${data.name}','${data.description}','${data.date}',${data.cost},${data.type},${data.location},${null},${true},${3});`;
};

//Export functions as object//

const queryList = {
    _QueryGetRoomsListString: QueryGetRoomsListString,
    _QueryGetAssetsTypeListString: QueryGetAssetsTypeListString,
    _QueryGetAssetByIDString: QueryGetAssetByIDString,
    _QueryGetAllCountEmployees: QueryGetAllCountEmployees,
    _QueryGetAllCountActiveAssets: QueryGetAllCountActiveAssets,
    _QueryGetEmployees: QueryGetEmployees,
    _QueryGetLocationList: QueryGetLocationList,
    _QueryGetCategoriesList: QueryGetCategoriesList,
    _QueryGetOfficeInfo: QueryGetOfficeInfo,
    _QueryGetAllAssetsList: QueryGetAllAssetsList,
    _QueryInsertAsset: QueryInsertAsset
}

export {queryList};
