// indian.c 印度

#include "name.h"

STATIC_VAR_TAG mapping ma_sname_i = ([
        "萨"   : "sa",
        "拉"   : "la",
        "阿"   : "a",
        "乌"   : "wu",
        "阿比" : "abi",
        "亚比" : "yabi",
        "尤利" : "youli",
        "戡挞" : "kanda",
        "思戈" : "sige",
        "亨达" : "hengda",
        "腾格" : "tengge",
        "佛答" : "foda",
        "西戈" : "sige",
        "沙戈" : "shage", 
        "帕鲁" : "palu",
        "科纳" : "kena",
        "摩利" : "moli",
        "干亚" : "ganya",
        "玛曼可" : "mamanke",
        "斯坎挞" : "sikanda",
        "玛斯鲁" : "masilu",
        "曼克雅" : "mankeya",
]);

STATIC_VAR_TAG mapping ma_pname_i = ([
        "牟禄" : "molu",
        "摩克" : "moke",
        "曼都" : "mandu",
        "尤拿" : "youna",
        "占科" : "zhanke",
        "尚柯" : "shangke",
        "法特" : "fate",
        "休利" : "xiuli",
        "昊戈" : "haoge",
        "达姆" : "damu",
        "利姆" : "limu",
        "斯穆" : "simu",
        "罕特" : "hante",
        "罕么" : "hanme",
        "塔姆" : "tamu",
        "恩姆" : "enmu",
        "海穆" : "haimu",
        "甘姆" : "ganmu",
        "斯玛特" : "simate",
        "翰南利" : "hannali",
        "西曼达" : "simanda",
        "亚利达" : "yalida",
        "斯曼卡" : "simanka",
        "菲穆达" : "feimuda",
]);

void generate_in_name(object ob)
{
        string name, sname, pname, id1, id2;
        string *ks, *kp;

        ks = keys(ma_sname_i);
        kp = keys(ma_pname_i);
        sname = ks[random(sizeof(ks))];
        pname = kp[random(sizeof(kp))];
        id1 = ma_sname_i[sname];
        id2 = ma_pname_i[pname];        
        name = sname + pname;

        if (ob) ob->set_name(name, ({ id1 + " " + id2, id1, id2 }));
}

