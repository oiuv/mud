// Inherit: condiction:poison

#include <ansi.h>
#include <condition.h>

// Notify here:
// If someone try to dispel all condition, he must dispel
// one by one.
// If the dispel function of a condition was null, then
// the condition will be ignore from dispel, BUT, IF THE
// DISPEL FUNCTION RETURN BY ONE, the object will stop
// to dispel next condition.
// Or, the condition may not ill or poison, only for other
// purpose, so the dispel function of the condition should
// return by -1 to indicate it.

// Here is the base of poison-condition. If you want to
// design a non-poison condition, just don't inherit me.

// -----------------------------------------------------------

// Some creature may be poison, or some drug, medice, when
// other one has been ... So the caller doesn't want to call
// 'apply_condition' but do_effect.

// Description of the poison:
// level : the poison's level, refer the force skill
// remain: how much poison left, -1 will be non-limit
// id    : who make this poison
// name  : the name of the poison, defulat:"nature poison"

string chinese_name() { return "毒"; }

string update_msg_others()
{
        return HIG "$N" HIG "痛苦的呻吟了一声。\n" NOR;
}

string update_msg_self()
{
        return HIG "你中的$?" HIG "发作了。\n" NOR;
}

string die_msg_others()
{
        return RED "$N" RED "嘶哑着叫了两声，就不再喘气了。\n" NOR;
}

mapping mixed_poison(mapping p1, mapping p2)
{
        mapping p;
        int r;

        if (! p1 && ! p2)
                return 0;

        p = allocate_mapping(4);

        // calculate the remain poison
        if (p1) r = (p1["remain"] ? p1["remain"] : (int)p1["level"] * (int)p1["duration"]);
        else    r = 0;

        if (p2) r += (p2["remain"] ? p2["remain"] : (int)p2["level"] * (int)p2["duration"]);

        if (! p2)
        {
                p["level"]  = p1["level"];
                p["id"]     = p1["id"];
                p["name"]   = p1["name"];
                p["remain"] = r;
                return p;
        }

        if (! p1)
        {
                p["level"]  = p2["level"];
                p["id"]     = p2["id"];
                p["name"]   = p2["name"];
                p["remain"] = r;
                return p;
        }

        // generate the new id
        if (! p1["id"]) p1["id"] = p2["id"]; else
        if (! p2["id"]) p2["id"] = p1["id"];

        if (! p1["id"] || p1["id"] != p2["id"])
                // poison made by two man mixed
                p["id"] = "...";
        else
                p["id"] = p1["id"];

        // compare & decide the new level
        p["level"] = p1["level"];
        if (p["level"] < p2["level"])
                p["level"] = p2["level"];

        // generate the new poison name
        if (! p1["name"]) p1["name"] = p2["name"]; else
        if (! p2["name"]) p2["name"] = p1["name"];
        if (! p1["name"] || p1["name"] != p2["name"])
        {
                // two poison mixed
                if (p["level"] >= 100)
                        p["name"] = "剧毒";
                else
                        p["name"] = "毒";
        } else
                p["name"] = p1["name"];

        // decide the remain of poison
        p["remain"] = r;

        return p;
}

int do_effect(object ob, string cnd, mapping p)
{
        mapping cnd_info;
        // int d;

        if (! p || ! intp(p["level"]) || ! intp(p["duration"]) ||
            ! stringp(p["id"]))
                return 0;

        if (! stringp(p["name"])) p["name"] = this_object()->chinese_name();

        cnd_info = mixed_poison(ob->query_condition(cnd), p);
        ob->apply_condition(cnd, cnd_info);
        return 1;
}

int dispel(object me, object ob, mapping cnd)
{
        int my_lvl;
        int need_lvl;
        int cost_neili;
        int power;
        int dis;
        string pos;

        if (! cnd || ! intp(cnd["level"]) || ! intp(cnd["remain"]) ||
            ! stringp(cnd["id"]))
                return 0;

        if (! stringp(cnd["name"]))
                cnd["name"] = "毒";

        pos = cnd["name"];
        if (me->query("neili") < 200)
        {
                tell_object(me, "你内力不足，无法驱散" + pos + "。\n");
                return -1;
        }

        need_lvl = cnd["level"] + 10;
      	if (ob->query("breakup"))
      		      need_lvl = need_lvl * 7 / 10;

        if (ob->query("immune/poison") == -1)
                need_lvl = 1;
        else
                need_lvl -= ob->query("immune/poison");
        if (need_lvl < 1) need_lvl = 1;

        if (me != ob)
                need_lvl += need_lvl / 5;

        if (cnd["id"] == me->query("id"))
                need_lvl = 50;

        my_lvl = me->query_skill("force") +
                 me->query_skill("poison") / 5 +
                 me->query_skill("dispel-poison", 1) +
				 me->query_skill("medical") / 5 +
                 me->query_temp("apply/dispel-poison");
        if (need_lvl > my_lvl)
        {
                if (me == ob)
                {
                        tell_object(me, MAG "你运用内功驱散" + pos +
                                    "，然而似乎没有半点效果。\n" NOR);
                        me->start_busy(1);
                        return -1;
                } else
                {
                        tell_object(me, MAG "你运用内功帮助" + ob->name() +
                                    "驱散" + pos + "，然而似乎没有半点效果。"
                                    "\n" NOR);
                        tell_object(ob, MAG + me->name() + "将内力缓缓的输"
                                    "入你的体力，你觉得一阵恶心，几欲呕吐。"
                                    "\n" NOR);
                        me->start_busy(1);
                        ob->start_busy(1);
                        return -1;
                }
        }

        // 去毒能力
        power = my_lvl + me->query_skill("dispel-poison", 1) +
                me->query_temp("apply/dispel-poison");
	if (ob->query("breakup"))
		power += power * 3 / 10;
        if (me == ob)
        {
                if (cnd["id"] == me->query("id"))
                {
                        tell_object(me, WHT "你运用内功，将" + pos +
                                    "尽数驱散。\n" NOR);
                        me->add("neili", -100);
                        cnd["remain"] = 0;
                        me->start_busy(1);
                } else
                {
                        cost_neili = me->query("neili");
                        dis = me->query("neili") * power / (cnd["level"] + 1) / 2;
                        if (cnd["remain"] == -1)
                                cnd["remain"] = 10000;
                        if (dis >= cnd["remain"])
                        {
                                dis = cnd["remain"];
                                cost_neili = cnd["remain"] * 2 * (cnd["level"] + 1) /
                                             power;
                                tell_object(me, WHT "你运用内功，将" + pos +
                                            "尽数驱散。\n" NOR);
                        } else
                        {
                                tell_object(me, WHT "你运用内功，驱散了一些" + pos +
                                            "。\n" NOR);
                        }
                        cnd["remain"] -= dis;
                        if (cnd["remain"] < 0)
                                cnd["remain"] = 0;
                        me->add("neili", -cost_neili);
                        me->start_busy(2 + random(2));
                }
        } else
        {
                if (cnd["id"] == me->query("id"))
                {
                        tell_object(me, WHT "你运用内功，帮助" + ob->name() +
                                    "将" + pos + "尽数驱散。\n" NOR);
                        me->add("neili", -150);
                        cnd["remain"] = 0;
                        me->start_busy(2);
                        ob->start_busy(1);
                } else
                {
                        cost_neili = me->query("neili");
                        dis = me->query("neili") * power / (cnd["level"] + 1) / 4;
                        if (cnd["remain"] == -1)
                                cnd["remain"] = 10000;
                        if (dis >= cnd["remain"])
                        {
                                dis = cnd["remain"];
                                cost_neili = cnd["remain"] * 4 * (cnd["level"] + 1) /
                                             power;
                                tell_object(me, WHT "你运用内功，帮助" + ob->name() +
                                            "将" + pos + "尽数驱散。\n" NOR);
                        } else
                        {
                                tell_object(me, WHT "你运用内功，帮助" + ob->name() +
                                            "驱散了一些" + pos + "。\n" NOR);
                        }
                        cnd["remain"] -= dis;
                        if (cnd["remain"] < 0)
                                cnd["remain"] = 0;
                        me->add("neili", -cost_neili);
                        me->start_busy(4 + random(4));
                        ob->start_busy(2 + random(2));
                }
        }

        if ( cnd["remain"] == 0)
                ob->clear_condition(this_object()->name());

        return 1;
}

// calucate the damage of jing per heart beaten
int jing_damage(object me, mapping cnd)
{
        int d;

        d = cnd["level"];

        if (d >= 64)
                d = 24 + (d - 64) / 8;
        else
        if (d >= 32)
                d = 16 + (d - 32 ) / 4;
        else
                d /= 2;
        if (d < 10) d = 10;

        return d / 2 + random(d);
}

// calucate the damage of qi per heart beaten
int qi_damage(object me, mapping cnd)
{
        int d;

        d = cnd["level"];

        if (d > 300 )
                d = 100 + (d - 300) / 12;
        else
        if (d > 60)
                d = 60 + (d - 60 ) / 6;
        if (d < 10) d = 10;

        return d / 2 + random(d);
}

// die reason
string die_reason(string name)
{
        if (! name || name == "毒")
                return "毒发身亡了";
        else
                return name + HIM "发作身亡了";
}

int update_condition(object me, mapping cnd)
{
        int jd;
        int qd;
	int jw;
	int qw;
        int improve;

	//if (! mapp(cnd) || me->query_temp("nopoison")) return 0;
	//为转世特技诸邪辟易增加百毒不侵效果 by 薪有所属
	       if (! mapp(cnd) || me->query_temp("nopoison") ||
            me->query("special_skill/piyi"))
                return 0;

        if (! intp(cnd["level"]) ||
	    ! intp(cnd["remain"] ||
	    ! stringp(cnd["id"])))
                return 0;

        jd = this_object()->jing_damage(me, cnd);
        qd = this_object()->qi_damage(me, cnd);

        if (! living(me) && (me->query("jing") < jd || me->query("qi") < qd))
        {
                me->set_temp("die_reason", die_reason(cnd["name"]));
                message_vision(die_msg_others(), me);
                me->die();
                return 1;
        }

	jw = jd / 2;
	qw = qd / 2;
	if (jw > me->query("eff_jing"))
	{
		jw = me->query("eff_jing");
		if (jw < 0) jw = 0;
	}

	if (qw > me->query("eff_qi"))
	{
		qw = me->query("eff_qi");
		if (qw < 0) qw = 0;
	}

        improve = (int)me->query("immune/poison");
        if (improve != -1)
        {
                me->receive_damage("jing", jd);
	        me->receive_wound("jing",  jw);
                me->receive_damage("qi",   qd);
	        me->receive_wound("qi",    qw);
        }

        if (cnd["id"] == "nature poison" || improve == -1 ||
            cnd["level"] / 2 + random(cnd["level"]) < (int)me->query_skill("force") + improve)
        {
                // 抗毒能力发挥作用
                if (improve == -1)
                        cnd["remain"] = 0;
                else
                        cnd["remain"] -= improve;

                if (cnd["remain"] <= cnd["level"])
                {
                        message("vision", HIM + me->name() + "长长的吁"
                                "了一口气，看起来神色好多了。\n" NOR,
                                environment(me), ({ me }));
                        tell_object(me, HIM "你觉得身上的" + cnd["name"] +
                                    HIM "不住的消退，感觉上好多了，不"
                                    "禁长长的吁了一口气。\n" NOR);
                        return 0;
                }

                // 正常去毒
                cnd["remain"] -= cnd["level"];
	        me->apply_condition(this_object()->name(), cnd);
        }

        message("vision", replace_string(update_msg_others(), "$N",
                          me->name()), environment(me), ({ me }));
	tell_object(me, replace_string(update_msg_self(), "$?", cnd["name"]));

	return CND_NO_HEAL_UP | CND_CONTINUE;
}
