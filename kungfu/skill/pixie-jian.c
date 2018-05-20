#include <ansi.h>
inherit FORCE;
inherit SKILL;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("pixie-jian", 1);
        if (me->query("special_skill/guimai"))
                return lvl * lvl * 20 * 15 / 100 / 200;
        else
                return lvl * lvl * 12 * 15 / 100 / 200;
}

string *dodge_msg = ({
        "ͻȻ֮�䣬��Ӱ���ϣ�$n��󻬳����࣬��ʱ�ֻص���ԭ�أ������$N��һ�С�\n",
        "$n�ֱۻ�ת����$N������һ�ƣ�˳������һ�ԡ�\n",
        "$n�����������$N������Ѹ���ޱȵ�һ����˳������һ�ԡ�\n",
        "$n����Ʈ����������ȣ�ת�˼�ת���Ʋ���$N����󣬶����$N��һ�С�\n",
        "$Nֻ����ǰһ�����ƺ�����$n����һ�ϣ����漴�ּ�$n�ص�ԭ�أ�ȴ�ƴ�δ�뿪��\n",
        "$N�۾�һ����$n��û����Ӱ��ͻȻ$n���������һ��$N��ͷ������Ծ����\n",
        "$n��ȻһЦ������֮����$N����֪����Ǻã�ͣס�˹�����\n",
});

string *finger_name = ({ "������ָ", "��������ָ", "����ʳָ",
                         "������ָ", "��������ָ", "����ʳָ", }); 

mapping *action = ({
([  	"action":"ͻȻ֮�䣬��Ӱ���ϣ�$N��󻬳����࣬��ʱ�ֻص���ԭ��",
    	"force" : 160,
    	"attack": 40,
    	"parry" : 30,
    	"dodge" : 120,
    	"damage": 150,
    	"lvl" : 0,
    	"skill_name" : "��Ӱ����",
    	"damage_type":  "����"
]),
([  	"action":"$N�����������$n������Ѹ���ޱȵ�һ����$n��Щ�����Լ�С��",    
    	"force" : 180,
    	"attack": 50,
    	"parry" : 30,
    	"dodge" : 135,
    	"damage": 160,
    	"lvl" : 20,
    	"skill_name" : "�Լ�С��",
    	"damage_type":  "����"
]),
([  	"action":"�����$N�����ϣ��ڵ�$n�������Ծ��ԭ��",
    	"force" : 225,
    	"attack": 60,
    	"parry" : 35,
    	"dodge" : 155,
    	"damage": 170,
    	"lvl" : 40,
    	"skill_name" : "������",
    	"damage_type":  "����"
]),
([  	"action":"$NͻȻ���з�һ�䣬$w�����������ʽ������ס�$n����֮�з������",
    	"force" : 230,
    	"attack": 70,
    	"parry" : 40,
    	"dodge" : 160,
    	"damage": 180,
    	"lvl" : 60,
    	"skill_name" : "�з�һ��",
    	"damage_type":  "����"
]),
([  	"action":"$N����Ʈ����������ȣ�ת�˼�ת���Ʋ���$n�����",
    	"force" : 240,
    	"attack": 80,
    	"parry" : 50,
    	"dodge" : 170,
    	"damage": 200,
    	"lvl" : 80,
    	"skill_name" : "�������",
    	"damage_type":  "����"
]),
([  	"action":"$Nһ����Ц������Ｒ����ǰ��һ˲֮�䣬��$n����Ѳ���һ�ߣ�$w�漴�ݳ�",
    	"force" : 260,
    	"attack": 70,
    	"parry" : 40,
    	"dodge" : 165,
    	"damage": 220,
    	"lvl" : 100,
    	"skill_name" : "������ǰ",
    	"damage_type":  "����"
]),
([  	"action":"$N�ȵ������ã������㼴�γ�$w�����ִ̳�������ת����ȥ",
    	"force" : 300,
    	"attack": 90,
    	"parry" : 45,
    	"dodge" : 180,
    	"damage": 230,
    	"lvl" : 120,
    	"skill_name" : "���ִ̳�",
    	"damage_type":  "����"
]),
([  	"action":"$nֻ����ǰһ�����ƺ�����$N����һ�ϣ����漴�ּ�$N�ص�ԭ�أ�ȴ�ƴ�δ�뿪",
    	"force" : 340,
    	"attack": 80,
    	"parry" : 40,
    	"dodge" : 185,
    	"damage": 250,
    	"lvl" : 140,
    	"skill_name" : "��ǰһ��",
    	"damage_type":  "����"
]),
([  	"action":"$N����ˣ�$n��׷������ͻȻ��$N����$n��ǰ������$wֱָ$n��$l",
    	"force" : 380,
    	"attack": 100,
    	"parry" : 50,
    	"dodge" : 190,
    	"damage": 270,
    	"lvl" : 160,
    	"skill_name" : "�����",
    	"damage_type":  "����"
]),
([  	"action":"$N��س嵽$n��ǰ������$wֱ��$n���ۣ�$n��æ�мܣ�����$N��$wͻȻת��",
    	"force" : 410,
    	"attack": 130,
    	"parry" : 55,
    	"dodge" : 210,
    	"damage": 300,
    	"lvl" : 180,
    	"skill_name" : "ֱ������",
    	"damage_type":  "����"
]),
([  	"action":"$N����Ծ��$ņ��һ����������$N����ֱ����£�����$w����$n��$l",
    	"force" : 440,
    	"attack": 130,
    	"parry" : 50,
    	"dodge" : 230,
    	"damage": 320,
    	"lvl" : 200,
    	"skill_name" : "����Ծ��",
    	"damage_type":  "����"
]),
([  	"action":"$N��֦�Ͱڣ�$n��ǰ�·�ͻȻ�������߰˸�$N���߰�ֻ$wһ�����$n",
    	"force" : 480,
    	"attack": 140,
    	"parry" : 60,
    	"dodge" : 270,
    	"damage": 340,
    	"lvl" : 220,
    	"skill_name" : "��֦�Ͱ�",
    	"damage_type":  "����"
]),
});

int valid_enable(string usage)
{
        return usage == "sword" ||
               usage == "dodge" ||
               usage == "parry" ||
               usage == "force" ||
               usage == "unarmed";
}

int double_attack() { return 1; }

int valid_learn(object me)
{
        if (me->query("character") == "��������" ||
           me->query("character") == "������")
                return notify_fail("�����а��������а���������𼺣����������á�\n");
//ת���ؼ���������ȡ��Ů������ by н������
        if (me->query("gender") == "Ů��" && ! me->query("special_skill/guimai"))
                return notify_fail("�Թ�����û��˵��Ů�˿�����ϰ�������䡣\n");
//ת���ؼ���������ȡ����������  by н������
        if (me->query("gender") == "����" && ! me->query("special_skill/guimai"))
        {
                me->receive_wound("qi", 50);
                return notify_fail(HIR "\n������������а��������ʱֻ����Ϣ��Ȼ��"
                                   "�ң���������\n" NOR);
        }

        if (me->query("int") < 34)
                return notify_fail("������ʲ��㣬�޷�����а���������⡣\n");

        if (me->query("dex") < 32)
                return notify_fail("������������������������а������\n");

        if (me->query_skill("sword", 1) < 100)
                return notify_fail("��Ļ�����������̫ǳ���޷�����а������\n");

        if (me->query_skill("dodge", 1) < 100)
                return notify_fail("��Ļ����Ṧ����̫ǳ���޷�����а������\n");

        if (me->query_skill("parry", 1) < 100)
                return notify_fail("��Ļ�����������̫ǳ���޷�����а������\n");

        if (me->query_skill("force", 1) < 100)
                return notify_fail("��Ļ����ڹ�����̫ǳ���޷�����а������\n");

        if (me->query_skill("sword", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("��Ļ��������������ޣ��޷���������ı�а������\n");

        if (me->query_skill("dodge", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("��Ļ����Ṧ�������ޣ��޷���������ı�а������\n");

        if (me->query_skill("parry", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("��Ļ����м��������ޣ��޷���������ı�а������\n");

        if (me->query_skill("unarmed", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("��Ļ���ȭ���������ޣ��޷���������ı�а������\n");

        if (me->query_skill("force", 1) < me->query_skill("pixie-jian", 1))
                return notify_fail("��Ļ����ڹ��������ޣ��޷���������ı�а������\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("pixie-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("pixie-jian", 1) < 100 ||
			me->query_skill_mapped("force") != "pixie-jian" ||
			me->query_skill_mapped("dodge") != "pixie-jian" ||
			me->query_skill_mapped("parry") != "pixie-jian" ||
            ! living(me))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("dodge") + mp;
        dp = me->query_skill("dodge", 1) / 2 +
             me->query_skill("pixie-jian", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(4))
                {
                case 0:
                        result += (["msg" : HIR "$N" HIR "�۾�һ����$n" HIR "��û����"
                                            "Ӱ��ͻȻ$n" HIR "���������һ��$N" HIR "��"
                                            "ͷ������Ծ����\n" NOR]);
                        break;
                case 1:
                        result += (["msg" : HIR "$N" HIR "��ǰһ�����ƺ�����$n" HIR "��"
                                            "��һ�Σ����漴�ּ�$n" HIR "�ص�ԭ�أ�ȴ��"
                                            "��δ�뿪��\n" NOR]);
                        break;
                case 2:
                        result += (["msg" : HIR "$n" HIR "����Ʈ����������ȣ�ת�˼�ת"
                                            "���Ʋ���$N" HIR "����󣬶����$N" HIR "��"
                                            "һ�С�\n" NOR]);
                        break;
                default:
                        result += (["msg" : HIR "ͻȻ���Ӱ���Σ�$n" HIR "��󻬳�����"
                                            "����ʱ�ֻص���ԭ�أ������$N" HIR "��һ��"
                                            "��\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(4))
                {
                case 0:
                        result = HIY "$N" HIY "�۾�һ����$n" HIY "��û����Ӱ"
                                 "������$N" HIY "��ͨ����˿����Ϊ���ң�����"
                                 "���С�\n" NOR;
                        break;
                case 1:
                        result = HIY "$N" HIY "��ǰһ�����ƺ�����$n" HIY "��"
                                 "��һ�Ρ�$N" HIY "һ����Ц����˲�俴��������"
                                 "ʵ��\n" NOR;
                        break;
                case 2:
                        result = HIY "$n" HIY "����Ʈ����������ȣ�ת�˼�ת��"
                                 "����$N" HIY "��Ҳ�����������о�ֱ������\n"
                                 NOR;
                        break;
                default:
                        result = HIY "ͻȻ���Ӱ���Σ�$n" HIY "��󻬳����࣬"
                                 "����$N" HIY "����˼����׷���ϣ�����������"
                                 "����\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int query_effect_dodge(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("pixie-jian", 1);
        if (lvl < 50)  return 0;
        if (lvl < 100) return 30;
        if (lvl < 150) return 40;
        if (lvl < 200) return 60;
        if (lvl < 250) return 80;
        if (lvl < 300) return 100;
        if (lvl < 350) return 120;
        return 130;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        if (random(10) >= 5  && me->query("special_skill/ghost"))
        {
                if (random(3))
                {
                        victim->receive_wound("qi", damage_bonus / 4, me);
                        return HIR "ֻ��" + victim->name() +
                               HIR "�������������������ط�����Ѫ˿��\n" NOR;
                }
                else
                {
                        victim->receive_wound("qi", damage_bonus / 3, me);
                        victim->receive_wound("jing", damage_bonus / 4, me);
                        return HIR "ֻ��" + victim->name() +
                               HIR "�����㱣���Ѫ����������Ѩλ������\n" NOR;
                }
        }
}

int practice_skill(object me)
{
        return notify_fail(HIC "��а����ֻ��ͨ����ϰ����а���ס��򡸿���"
                           "���䡹��ѧϰ��\n" NOR);
}
/*
int difficult_level()
{
        return 1200;
}
*/
//ת���ؼ��������������о��Ѷ� by н������
int difficult_level()
{
     object me; 
     int lv;
     me = this_player(); 
     lv = me->query_skill("pixie-jian", 1) - 180; 
     if (lv > 200) lv = 200; 
     
     if (! me->query("special_skill/guimai"))
        return 1400 - lv;
     else
        return 1200 - lv;

}
string perform_action_file(string action)
{
        return __DIR__"pixie-jian/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"pixie-jian/exert/" + action;
}
