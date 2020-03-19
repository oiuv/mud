// chuancai-jiyi.c

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "cooking"; }

int valid_learn(object me)
{
    return 1;
}

mapping query_menu(object me)
{
        return ([ "香酥花生"   : ({ "xiangshu huasheng" }),
                  "麻辣手撕鸡" : ({ "mala ji" }),
                  "手撕鸡"     : ({ "shousi ji" }),
                  "三黄鸡"     : ({ "sanhuang ji" }),
                  "干煸尤鱼"   : ({ "ganbian youyu" }),
                  "鱼香肉丝"   : ({ "yuxiang rousi" }),
                  "宫宝鸡丁"   : ({ "gongbao jiding" }),
                  "红油肚片"   : ({ "hongyou dupian" }),
                  "麻婆豆腐"   : ({ "mapo doufu" }),
                  "夫妻肺片"   : ({ "fuqi feipian" }),
                  "毛血旺"     : ({ "maoxue wang" }),
                  "粉蒸肉"     : ({ "fenzheng rou" }) ]);
}

int practice_skill(object me)
{
        object cailiao;

        if (! objectp(cailiao = present("cai liao", me)) ||
	    cailiao->query_amount() < 1)
                return notify_fail("你身上没有菜料了。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够了，无法锻炼手艺。\n");

        if ((int)me->query("jing") < 50)
                return notify_fail("你的精神不济，无法锻炼手艺。\n");

        me->receive_damage("qi", 40);
        me->receive_jing("jing", 40);
	cailiao->add_amount(-1);

        return 1;
}

