// japanese name

#include "name.h"

mapping jp_sname = ([
	"白木" : "baimu",
        "北条" : "beitiao",
        "川岛" : "chuandao",
        "村正" : "cunzheng",
        "东"   : "dong",
        "东条" : "dongtiao",
        "丰臣" : "fengchen",
        "服部" : "fubu",
        "高桥" : "gaoqiao",
        "黑田" : "heitian",
        "酒井" : "jiujing",
        "濑川" : "laichuan",
        "毛利" : "maoli",
        "木下" : "muxia",
	"青木" : "qingmu",
        "齐藤" : "qiteng",
        "松下" : "songxia",
        "山本" : "shanben",
        "手冢" : "shouzhong",
        "田中" : "tianzhong",
        "藤泽" : "tengze",
        "土肥" : "tufei",
        "武宫" : "wugong",
        "小山" : "xiaoshan",
        "小林" : "xiaolin",
        "小渊" : "xiaoyuan",
        "细川" : "xichuan",
        "依田" : "yitian",
        "织田" : "zhitian",
	"阵内" : "zhennei",
        "中田" : "zhongtian",
        "竹中" : "zhuzhong",
        "最上" : "zuishang",
]);

mapping jp_pname = ([
        "an"   : "安",
        "ao"   : "傲敖",
        "bang" : "邦",
        "bei"  : "北倍贝备",
        "biao" : "标",
        "cao"  : "草",
        "cang" : "苍仓",
        "chang": "昌",
        "chi"  : "迟驰",
        "ci"   : "此慈",
        "dong" : "东",
        "fa"   : "法",
        "fan"  : "凡蕃",
        "fang" : "访",
        "feng" : "风丰奉枫",
        "fu"   : "夫符",
        "gao"  : "高",
        "hao"  : "昊",
        "hong" : "宏",
        "hui"  : "惠",
        "ji"   : "极基记纪季继吉绩稷奇",
        "jian" : "渐剑见",
        "ke"   : "科",
        "lang" : "朗琅",
        "li"   : "历利立力",
        "lin"  : "临",
        "mao"  : "瑁",
        "nan"  : "南",
        "qian" : "谦千",
        "qin"  : "钦",
        "qing" : "庆",
        "ran"  : "然",
        "ren"  : "仁刃壬仞",
        "shang": "上",
        "shen" : "审神申慎",
        "shi"  : "师史石时十世士适",
        "si"   : "思斯司",
        "tian" : "天田忝",
        "wan"  : "万",
        "wei"  : "卫微伟维威",
        "wu"   : "物务武午",
        "xi"   : "席洗夕",
        "xiao" : "萧霄",
        "xiong": "雄",
        "yang" : "洋阳央",
        "yi"   : "易亦伊夷义宜仪译逸奕弈懿",
        "yin"  : "因引",
        "ying" : "映英影",
        "you"  : "右酉",
        "yu"   : "渔语预",
        "zhi"  : "制知智志直治",
        "zhong": "中",
        "zhou" : "周州舟",
        "zhu"  : "竹足",
        "zhuo" : "卓擢",
        "zi"   : "子",
        "zong" : "宗",
        "zuo"  : "左",
]);

mapping jp_number = ([
        "tai" : "太",
        "ci"  : "次",
        "san" : "三",
        "si"  : "四",
        "wu"  : "五",
]);

void generate_jp_name(object ob)
{
        string name, pname1, pname2, id, id1, id2;
        string *r, *ks;

        ks = keys(jp_sname);
        name = ks[random(sizeof(ks))];
        id = jp_sname[name];

        r = select_a(jp_pname, id);
        id1 = r[0];
        pname1 = r[1];

        if (random(2))
        {
                r = select_a(jp_pname, id);
                id2 = r[0];
                pname2 = r[1];
        } else
        {
                r = select_a(jp_number, id);
                id2 = r[0];
                pname2 = r[1];
                if (random(3))
                {
                        pname1 = pname2 + "郎";
                        id1    = id2 + "lang";
                } else
                {
                        pname1 += pname2;
                        id1    += id2;
                }
                pname2 = "";
                id2    = "";
        }

        switch (random(2))
        {
        case 0:
                id2 = id1 + id2;
                id1 = id;
                id += " " + id2;
                name += pname1 + pname2;
                break;
        case 1:
                id2 = id1;
                id1 = id;
                id += " " + id2;
                name += pname1;
        }

        if (ob) ob->set_name(name, ({ id, id1, id2 }));
}
