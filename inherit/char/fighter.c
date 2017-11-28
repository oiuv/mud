// fighter 练功人

#include <ansi.h>

inherit NPC;

void create() { seteuid(getuid()); }

void setup()
{
        set_weight(1000000);
        set("not_living", 1);
        set("fight_times", 0);

        ::setup();

        set_temp("eff_status_msg", "它看起来还可以继续用来练功。");
}

void unconcious()
{
        message_vision(HIY "咔喇一声，" + name() +
		       "坏了。\n\n" NOR, this_object());
        set("jing", 0);
        set("eff_jing", 0);
        set("qi", 0);
        set("eff_qi", 0);
        set("damaged", 1);
        set_temp("eff_status_msg", HIR " 它已经被打坏了。" NOR);
}

void die()
{
	message_vision(HIR "\n一阵希哩哗啦的声音过后，" + name() +
		       "算是彻底的报废了。\n\n" NOR, this_object());
	destruct(this_object());
}

int accept_fight(object ob)
{
        mapping hp_status, skill_status, map_status, prepare_status;
        mapping my;
        string *sname, *mname, *pname;
        int i, temp;
        int scale;
        object env;

        env = environment();
        if (stringp(env->query("for_family")) &&
            env->query("for_family") == ob->query("family/family_name") &&
            ob->query("out_family"))
                return notify_fail("你还是外出历练吧，不能总呆在这里。\n");

        if (ob->query("combat_exp") < 12000)
                return notify_fail("你这点身手还不足以和" + name() + "练功。\n");

        if (is_fighting())
		return notify_fail("这个" + name() + "正在和人练功呢。\n");

        if (query("damaged"))
                return notify_fail("这个" + name() + "已经被打坏了！\n"); 

        if (query("fight_times") >= 10) {
		unconcious();
                return notify_fail("这个" + name() + "已经被打坏了！\n"); 
        }

        if (objectp(query("last_fighter")) &&
	    query("last_fighter")->query("id") != ob->query("id"))
                return notify_fail("这是" + query("fighter_name") +
				   "的练功木人！\n");         

        set("last_fighter", ob);
	set("fighter_name", ob->name());
        add("fight_times", 1);

        my = query_entire_dbase();

        if (undefinedp(my["scale"]))
                my["scale"] = 100;

	if (undefinedp(my["max_exp"]))
		my["max_exp"] = 2000000;

	if (undefinedp(my["max_skill"]))
		my["max_skill"] = 200;

/* delete and copy skills */

        if (mapp(skill_status = query_skills()))
	{
                skill_status = query_skills();
                sname  = keys(skill_status);

                temp = sizeof(skill_status);
                for (i = 0; i < temp; i++)
                        delete_skill(sname[i]);
        }

        if (mapp(skill_status = ob->query_skills()))
	{
                skill_status = ob->query_skills();
                sname  = keys(skill_status);

                for (i = 0; i < sizeof(skill_status); i++)
		{
			int sk;

			sk = skill_status[sname[i]];
			if (sk > my["max_skill"])
				sk = my["max_skill"];
                        set_skill(sname[i], sk);
                }
        }
        
/* delete and copy skill maps */

        if (mapp(map_status = query_skill_map()))
	{
                mname = keys(map_status);

                temp = sizeof(map_status);
                for (i = 0; i < temp; i++)
                        map_skill(mname[i]);
        }

        if (mapp(map_status = ob->query_skill_map()))
	{
                mname  = keys(map_status);

                for (i = 0; i < sizeof(map_status); i++)
                        map_skill(mname[i], map_status[mname[i]]);
        }

/* delete and copy skill prepares */

        if (mapp(prepare_status = query_skill_prepare()))
	{
                pname  = keys(prepare_status);

                temp = sizeof(prepare_status);
                for (i = 0; i < temp; i++)
                        prepare_skill(pname[i]);
        }

        if (mapp(prepare_status = ob->query_skill_prepare()))
	{
                pname  = keys(prepare_status);

                for (i = 0; i < sizeof(prepare_status); i++)
                        prepare_skill(pname[i], prepare_status[pname[i]]);
        }

        hp_status = ob->query_entire_dbase();

        scale = my["scale"];

        my["str"] = hp_status["str"];
        my["int"] = hp_status["int"];
        my["con"] = hp_status["con"];
        my["dex"] = hp_status["dex"];

        my["max_qi"]     = hp_status["max_qi"]   * scale / 100;
        my["eff_qi"]     = hp_status["eff_qi"]   * scale / 100;
        my["qi"]         = hp_status["qi"]       * scale / 100;
        my["max_jing"]   = hp_status["max_jing"] * scale / 100;
        my["eff_jing"]   = hp_status["eff_jing"] * scale / 100;
        my["jing"]       = hp_status["jing"]     * scale / 100;
        my["max_neili"]  = hp_status["max_neili"]* scale / 100;
        my["neili"]      = hp_status["neili"]    * scale / 100;
        my["jiali"]      = hp_status["jiali"];
        my["combat_exp"] = hp_status["combat_exp"];

        if (! undefinedp(my["min_exp"]) &&
            my["combat_exp"] < my["min_exp"])
                my["combat_exp"] = my["min_exp"];

	if (my["combat_exp"] > my["max_exp"])
		my["combat_exp"] = my["max_exp"];

	reset_action();

        return 1;
}

int accept_hit(object ob)
{
        if (this_object()->query("damaged"))
                return notify_fail("这个" + name() + "已经被打坏了！\n");

        if (ob->query("combat_exp") < 12000)
                return notify_fail("你这点身手还不足以和" + name() + "练功。\n");

        return 1;
}

int accept_kill(object ob)
{
        object me;

        me = this_object();

        if (ob->is_busy())
                return notify_fail("你现在正忙，没有时间拆东西。\n");

        if (ob->query("combat_exp") < 12000)
                return notify_fail("你这点身手还不足以拆掉" + name() + "。\n");

        if (! me->query("damaged") && ob->query("combat_exp") < me->query("combat_exp"))
        {
            	message_vision("$N扑上去想拆掉$n，结果$n“蓬蓬”几下"
			       "就把$N撩倒在地。\n", ob, me);
            	ob->start_busy(3);
            	write("这个练功的" + name() + "太强了，你拆不掉它。\n");
		return -1;
        }

        ob->start_busy(2);
        remove_call_out("destroy");
        call_out("destroy", 0, ob, me);

	write("上！\n");
	return -1;
}

int accept_ansuan(object ob)
{
        return notify_fail("一个" + name() + "有什么好暗算的？\n");
}

// remove kill action
void kill_ob(object ob)
{
        fight_ob(ob);
}

void remove_enemy(object ob)
{
        ::remove_enemy(ob);
        if (ob == query("last_fighter"))
        {
                remove_call_out("renewing");
                call_out("renewing", 30 + random(30), ob);
        }
}

void destroy(object ob, object me)
{
        if (! objectp(me))
            return;

        message_vision("$N扑上去几下子就把$n给拆了。\n", ob, me);
        destruct(me);
}

void renewing(object ob)
{
        if (! ob || ! is_fighting(ob))
	{
                delete("last_fighter");
		delete("figher_name");
	}
}

