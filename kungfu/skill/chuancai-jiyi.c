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
        return ([ "ÏãËÖ»¨Éú"   : ({ "xiangshu huasheng" }),
                  "ÂéÀ±ÊÖËº¼¦" : ({ "mala ji" }),
                  "ÊÖËº¼¦"     : ({ "shousi ji" }),
                  "Èý»Æ¼¦"     : ({ "sanhuang ji" }),
                  "¸ÉìÔÓÈÓã"   : ({ "ganbian youyu" }),
                  "ÓãÏãÈâË¿"   : ({ "yuxiang rousi" }),
                  "¹¬±¦¼¦¶¡"   : ({ "gongbao jiding" }),
                  "ºìÓÍ¶ÇÆ¬"   : ({ "hongyou dupian" }),
                  "ÂéÆÅ¶¹¸¯"   : ({ "mapo doufu" }),
                  "·òÆÞ·ÎÆ¬"   : ({ "fuqi feipian" }),
                  "Ã«ÑªÍú"     : ({ "maoxue wang" }),
                  "·ÛÕôÈâ"     : ({ "fenzheng rou" }) ]);
}

int practice_skill(object me)
{
        object cailiao;

        if (! objectp(cailiao = present("cai liao", me)) ||
	    cailiao->query_amount() < 1)
                return notify_fail("ÄãÉíÉÏÃ»ÓÐ²ËÁÏÁË¡£\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("ÄãµÄÌåÁ¦²»¹»ÁË£¬ÎÞ·¨¶ÍÁ¶ÊÖÒÕ¡£\n");

        if ((int)me->query("jing") < 50)
                return notify_fail("ÄãµÄ¾«Éñ²»¼Ã£¬ÎÞ·¨¶ÍÁ¶ÊÖÒÕ¡£\n");

        me->receive_damage("qi", 40);
        me->receive_jing("jing", 40);
	cailiao->add_amount(-1);

        return 1;
}

