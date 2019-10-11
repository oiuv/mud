#include <ansi.h>
inherit CLASS_D("generate") + "/chinese";

void create()
{
//      mapping my;

        ::create();
        set("age", 30 + random(30));
        set("long", "堕落入魔界的生灵。\n");
        set("scale", 150);
        set_temp("apply/armor", 30);
        set_temp("apply/damage", 20);
        set_temp("born_time", time());

        setup();
        if (clonep()) keep_heart_beat();
}

void set_from_me(object me, object ob)
{
        int exp;
        mapping my;
		
		NPC_D->init_npc_skill(this_object(), NPC_D->get_exp(me));
        my = query_entire_dbase();
		
		my["max_jing"] = my["max_jing"] * 2;
		my["max_qi"] = my["max_qi"] * 2;
		
		if (my["max_jing"] < my["max_qi"] / 2)
                my["max_jing"] = my["max_qi"] / 2;

        my["eff_jing"] = my["max_jing"];
        my["jing"] = my["max_jing"];
        my["eff_qi"] = my["max_qi"];
        my["qi"] = my["max_qi"];

        exp = me->query("combat_exp") * 12 / 10;

        if (exp > query("combat_exp"))
                set("combat_exp", exp);

}

int accept_fight(object ob)
{
        command("say 我可没兴趣陪你玩，快给我滚开。");
        return 0;
}

int accept_hit(object ob)
{
        message_vision(HIW "$N" HIW "脸色一变，闪过一道杀气。怒"
                       "喝道：好一个" + RANK_D->query_rude(ob) +
                       "，来吧！\n" NOR, this_object());
        kill_ob(ob);
        return 1;
}

int accept_kill(object ob)
{
        if (! living(this_object()))
                return 1;
		
        return accept_hit(ob);
}

int accept_ansuan(object ob)
{
        return notify_fail("那人警惕性好高，你难以下手。\n");
}

int accept_touxi(object ob)
{
        return notify_fail("那人警惕性好高，你难以下手。\n");
}
/*
void unconcious()
{
        die();
}*/

void die(object ob)
{
	int lvl;
	
	lvl = this_object()->query("lvl");
	lvl += random(lvl * 5);
	ob = query_last_damage_from();
	if (random(3))
		ob->add("experience", lvl);
	else
		ob->add("potential", lvl);
	ob->add_temp("fuben_killed", 1);
	tell_object(ob, HIG "\n你获得了" + lvl + "点奖励。\n" NOR );
	
	::die();
}