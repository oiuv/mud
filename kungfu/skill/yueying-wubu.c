// yueying-wubu.c  月影舞步
inherit SKILL;

string *dodge_msg = ({
        "$n身形一晃，纤腰一扭，一招「星河鹭起」，弹地而起。\n",
        "$n一招「歌尽桃花扇底风」，$N只觉眼前一花，不见了$n的身影。\n",
        "$n一招「扫尽浮云风不定」，身形微晃，有惊无险地避开了$N这一招。\n",
        "只见$n身子向后一翻，一招「缥渺孤鸿影」，后荡而起，掠向一旁。\n" ,
        "$n一招「起舞弄清影」，长袖翻飞，躲过$N这一招。\n",
        "却见$n「万顷江田一鹭飞」，冲天而起，一波三折，端是美观。\n",
        "可是$n一个「流水落花春去也」，侧身一让，$N这一招扑了个空。\n",
        "只见$n一招「月轮穿沼水无痕」，倒掠身形，凌空两个翻转，退出两丈开外。\n",
        "$n息气上升，意存玉枕，一招「月在青天影在波」，身子飘然而起。\n",
});

int valid_enable(string usage) { return (usage == "dodge") || (usage == "move"); }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
	return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
	if( (int)me->query("qi") < 50 )
		return notify_fail("你的体力太差了，不能练月隐舞步。\n");

	me->receive_damage("qi", 40);
	return 1;
}

