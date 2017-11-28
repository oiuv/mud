// xiyang-boji.c 西洋搏击术

inherit SKILL;

string *dodge_msg = ({
	"$n身子一扭，恰好躲过了$N这一招。\n",
	"可是$n突然飞身后退，敏捷的躲过了$N这一招。\n",
	"$n奋力横移，闪开了$N的追击。\n",
	"$n身随$N转动，忽快忽慢，让$N无法捕捉到$n的踪影。\n",
        "$n嗔目大喝，气势异样恢弘，$N手一软，招数全然落空。\n",
});

int valid_enable(string usage) { return usage == "dodge"; }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，无法练习西洋搏击术。\n");

        me->receive_damage("qi", 40);
        return 1;
}
