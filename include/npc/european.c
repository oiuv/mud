// japanese name

#include "name.h"

mapping e_gname = ([
        "罗伯特"   : "robert",
        "戴维得"   : "david",
        "罗德"     : "rod",
        "阿贝尔"   : "abel",
        "肯尼"     : "kenny",
        "丹尼尔"   : "daniel",
        "大卫"     : "dave",
        "戴维恩"   : "devin",
        "道恩"     : "don",
        "怀特"     : "white",
        "布鲁克"   : "brook",
        "巴克"     : "buck",
        "查里斯"   : "charles",
        "克里斯特" : "christ",
        "克里斯托尔": "christopher",
        "克里弗德" : "clifford",
        "克拉克"   : "clark",
        "埃里维斯" : "elvis",
        "弗德"     : "ford",
        "哈里"     : "harry",
        "希曼"     : "hyman",
        "杰克"     : "jack",
        "杰夫"     : "jeff",
        "约翰"     : "john",
        "朱里安"   : "julian",
        "兰伯特"   : "lambert",
        "迈克斯"   : "max",
        "迈克尔"   : "michael",
        "威廉"     : "william",
        "菲利浦"   : "philip",
]);

mapping e_sname = ([
        "皮克克"     : "pycock",
        "阿伯特"     : "abbot",
        "艾思比特"   : "aisbett",
        "里格特索思" : "rigoutsos",
        "维斯"       : "weiss",
        "布拉蒂"     : "brady",
        "拉斯特曼"   : "lustman",
        "比恩弗德"   : "binford",
        "巴纳蒂"     : "barnard",
        "兰伯"       : "lamb",
        "布鲁斯蒂恩" : "blostein",
        "费思格勒"   : "fischler",
        "艾格特"     : "eggert",
        "弗格拉斯"   : "faugeras",
        "艾丁格"     : "ettinger",
        "格林姆逊"   : "grimson",
        "伍德斯"     : "woods",
        "汉森"       : "hansen",
        "汉贝尔"     : "hampel",
        "哈拉里克"   : "haralick",
        "内瓦蒂亚"   : "nevatia",
        "塞吉维克"   : "sedgewick",
        "威格斯勒"   : "wechsler",
        "沃尔夫"     : "wolff",
]);

void generate_e_name(object ob)
{
        string name, pname1, pname2, id, id1, id2;
        pname1 = keys(e_gname)[random(sizeof(e_gname))];
        pname2 = keys(e_sname)[random(sizeof(e_sname))];
        id1 = e_gname[pname1];
        id2 = e_sname[pname2];
        name = pname1 + "·" + pname2;
        id = id1 + " " + id2;
        if (ob) ob->set_name(name, ({ id, id1, id2 }));
}
