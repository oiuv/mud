// beihai.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("北海谪龙", ({ "king of dragon", "dragon" }) );
	set("title", HIC "龙族" NOR);
	set("gender", "男性");
	set("age", 23);
	set("long", @LONG
这是一个老人，眉目之间透出一股忧伤。
LONG );
	set("combat_exp", 10000000);
        set("shen_type", 0);
	set("attitude", "heroism");
        set("max_neili", 20000);
        set("neili", 20000);
        set("max_jing", 20000);
        set("jing", 20000);
        set("max_qi", 25000);
        set("qi", 25000);
        set("jingli", 20000);
        set("max_jingli", 20000);

        set("str", 100);
        set("int", 30);
        set("con", 100);
        set("dex", 100);

	set_skill("unarmed", 1200);
	set_skill("sword", 1200);
	set_skill("parry", 1200);
	set_skill("dodge", 1200);
	set_skill("force", 1200);

        set("jiali", 200);

        set_temp("apply/attack", 300);
        set_temp("apply/unarmed_damage", 500);
        set_temp("apply/armor", 1000);

        if (clonep(this_object()))
        {
                set("chat_chance", 30);
                set("chat_msg", ({ (: random_move :) }));
                set("born_time", time());
                keep_heart_beat();
        }

	setup();
}

void fight_ob(object ob)
{
	if (is_fighting(ob))
		return;

        message_vision(HIC "$N" HIC "大怒，一声暴喝，四周"
                       "登时雪花飘飘。\n" NOR, this_object(), ob);

        ::fight_ob(ob);
	if (! is_killing(ob->query("id")))
        	kill_ob(ob);
}

int accept_fight(object ob)
{
        message_vision("$N似乎没有听见$n在说什么。\n",
                       this_object(), ob);
        return 0;
}

int accept_kill(object ob)
{
        return 1;
}

int accept_hit(object ob)
{
        return 1;
}

mixed hit_ob(object me, object ob, int damage_bouns)
{
        ob->receive_wound("qi", 200 + random(200), me);
        me->set("neili", me->query("max_neili"));
        return HIC "$N" HIC "“哈”的一声吐出一口寒气，登时令$n"
               HIC "四肢几乎冻僵。\n" NOR;
}

void unconcious()
{
        die();
}

void die()
{
        object ob;

        ob = new("/clone/gift/cjade");
        command("chat 天哪！这年头，看来是没有我立足的地方了！");
        message_sort(HIC "$N" HIC "身子一旋，一阵冰雹忽然打来，待你睁眼，只听叮玲玲一声"
                     "轻响，掉下来一" + ob->query("unit") +
                     ob->name() + HIC "。\n" NOR, this_object());
        ob->move(environment());
        destruct(this_object());
}

void random_move()
{
	if (time() - query("born_time") > 1800)
	{
		message_vision("$N急急忙忙的走了。\n", this_object());
                CHANNEL_D->do_channel(this_object(), "rumor",
                        "听说" + name() + HIM "在人间反省自新，遇"
                        "赦免返回天界。" NOR);
		destruct(this_object());
		return;
	}
        NPC_D->random_move(this_object());
}
