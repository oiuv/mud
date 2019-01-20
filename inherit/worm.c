// Inherit: worm.c 毒虫
// Create by Vin for Heros.cn

#include <ansi.h>
inherit NPC;

int is_worm()
{
	return 1;
}

void setup()
{
        mapping p;

        p = this_object()->query("worm_poison");
        if (! p)
        {
                ::setup();
                return;
        }

        if (! intp(p["level"]))   p["level"]   = 30;
        if (! intp(p["perhit"]))  p["perhit"]  = 10;
        if (! intp(p["maximum"])) p["maximum"] = 20;
        if (! intp(p["remain"]))  p["remain"]  = p["maximum"];
        if (! intp(p["supply"]))  p["supply"]  = 1;
        if (! stringp(p["id"]))   p["id"]      = "nature worm";


        ::setup();
}

void init()
{
        object me/*, ob*/;

        ::init();
        if (! interactive(me = this_player()))
                return;

        if (present("xionghuang", this_player()) ||
            (int)me->query_skill("xiuluo-yinshagong", 1) >= 100)
                return;

        remove_call_out("kill_ob");
        call_out("kill_ob", 0, me);
}

mixed hit_ob(object me, object ob, int damage)
{
        mapping p;
        string  msg;
        int force;
        int dur;

        p = me->query("worm_poison");
        if (! p) return;
        if (damage / 3 + random(damage * 2 / 3) <
            (int)ob->query_temp("apply/armor"))
        {
                // Defeated by armor
                return;
        }

        msg = "";
        dur = p["perhit"];
        if (dur > (int)p["remain"]) dur = p["remain"];
        p["remain"] = (int)p["remain"] - dur;
        this_object()->apply_condition("poison-supply", 1);
        if (! dur) return;

        force = (int)ob->query_skill("force");
        if (random(force / 2) + force / 2 >= (int)p["level"] &&
            ob->query("neili") > damage / 5)
        {
                if (ob->query("qi") < 150)
                {
                        msg = MAG "你觉得伤口有些发麻，连忙运功化解，但是一时"
                                  "体力不支，难以施为。\n" NOR;
                } else
                if (ob->query("jing") < 60)
                {
                        msg = MAG "你觉得伤口有些发麻，连忙运功化解，但是一时"
                                  "精神不济，难以施为。\n" NOR;
                } else
                if (ob->query("neili") < damage / 5 + 50)
                {
                        msg = MAG "你觉得伤口有些发麻，连忙运功化解，但是一时"
                                  "内力不足，难以施为。\n" NOR;
                } else
                {
                        ob->add("neili", -damage / 5);
                        ob->receive_damage("qi", 20);
                        ob->receive_damage("jing", 10);
                        return HIM "你觉得被咬中的地方有些发麻，连忙运功化解"
                                   "毒性。\n" NOR;
                }
        }

        if (ob->affect_by("poison", ([ "level" : (int)p["level"],
                                       "name"  : "虫毒",
                                       "id"    : "nature poison",
                                       "duration" : dur, ])))
        {
                msg += HIR "$n" HIR "脸色一变，只觉被咬中的地方一阵麻木。\n" NOR;
        }

        return msg;
}