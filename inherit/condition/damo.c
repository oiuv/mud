// Inherit: condiction:damo

#include <ansi.h>

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
        int need_lvl;
        int cost_neili;
        int power;
        int dis;
        string pos;

        if (! cnd || ! intp(cnd["level"]) || ! intp(cnd["remain"]) ||
            ! stringp(cnd["id"]))
                return 0;

        pos = cnd["name"];
        if (me->query("neili") < 200)
        {
                tell_object(me, "你内力不足，无法化解" + pos + "。\n");
                return -1;
        }

        need_lvl = cnd["level"] + 10;
	if (ob->query("breakup"))
		need_lvl = need_lvl * 6 / 10;
        if (me != ob)
                need_lvl += need_lvl / 5;

        if (cnd["id"] == me->query("id"))
                need_lvl = 50;

        if (need_lvl > me->query_skill("force"))
        {
                if (me == ob)
                {
                        tell_object(me, MAG "你运用内功化解" + pos +
                                    "，然而似乎没有半点效果。\n" NOR);
                        me->start_busy(1);
                        return -1;
                } else
                {
                        tell_object(me, MAG "你运用内功帮助" + ob->name() +
                                    "化解" + pos + "，然而似乎没有半点效果。"
                                    "\n" NOR);
                        tell_object(ob, MAG + me->name() + "将内力缓缓的输"
                                    "入你的体力，你觉得一阵恶心，几欲呕吐。"
                                    "\n" NOR);
                        me->start_busy(1);
                        ob->start_busy(1);
                        return -1;
                }
        }

        // 去异常能力
        power = me->query_skill("force") +
				me->query_skill("poison") / 2 +
				me->query_skill("medical") / 4;
        if (me == ob)
        {
                if (cnd["id"] == me->query("id"))
                {
                        tell_object(me, WHT "你运用内功，将" + pos +
                                    "完全化解。\n" NOR);
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
                                            "完全化解。\n" NOR);
                        } else
                        {
                                tell_object(me, WHT "你运用内功，化解了一点" + pos +
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
                                    "将" + pos + "尽数化解。\n" NOR);
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
                                            "将" + pos + "尽数化解。\n" NOR);
                        } else
                        {
                                tell_object(me, WHT "你运用内功，帮助" + ob->name() +
                                            "化解了一点" + pos + "。\n" NOR);
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

// die reason
string die_reason(string name)
{
        if (! name || name == "毒")
                return "毒发身亡了";
        else
                return name + HIM "发作身亡了?";
}

int update_condition(object me, mapping cnd)
{
        int jd;
        int qd;
        int nd;
	int jw;
	int qw;

	if (! cnd) return 0;

        if (! intp(cnd["level"]) || ! intp(cnd["remain"] || ! stringp(cnd["id"])))
                return 0;

        jd = this_object()->jing_damage(me, cnd);
        qd = this_object()->qi_damage(me, cnd);
        nd = this_object()->neili_damage(me, cnd);

        if (! living(me) && (me->query("jing") < jd || me->query("qi") < qd))
        {
                me->set_temp("die_reason", die_reason(cnd["name"]));
                message_vision(this_object()->die_msg_others(), me);
                me->die();
                return 1;
        }

        if (jd)
        {
                // receive damage of jing
                me->receive_damage("jing", jd);
		jw = jd / 2;
		if (jw > me->query("eff_jing"))
		{
			jw = me->query("eff_jing");
			if (jw < 0) jw = 0;
		}
	        me->receive_wound("jing",  jw);
        }

        if (qd)
        {
                // receive damage of qi
                me->receive_damage("qi", qd);
		if (qw > me->query("eff_qi"))
		{
			qw = me->query("eff_qi");
			if (qw < 0) qw = 0;
		}
	        me->receive_wound("qi",  qw);
        }

        if (nd)
        {
                // receive cost of neili
                if (me->query("neili") >= nd)
                        me->add("neili", -nd);
                else
                        me->set("neili", 0);
        }

        if (cnd["level"] / 2 + random(cnd["level"]) < (int)me->query_skill("force"))
        {
                if (cnd["remain"] <= cnd["level"])
                {
                        message("vision", HIM + me->name() + "长长的吁"
                                "了一口气，看起来神色好多了。\n" NOR,
                                environment(me), ({ me }));
                        tell_object(me, HIM "你觉得身上的" + cnd["name"] +
                                    HIM "渐渐的不发生作用了，不"
                                    "禁长长的吁了一口气。\n" NOR);
                        return 0;
                }

                cnd["remain"] -= cnd["level"];
	        me->apply_condition(this_object()->name(), cnd);
        }

        message("vision", replace_string(this_object()->update_msg_others(), "$N",
                          me->name()), environment(me), ({ me }));
	tell_object(me, replace_string(this_object()->update_msg_self(), "$?", cnd["name"]));

	return 1;
}
