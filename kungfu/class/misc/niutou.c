// niutou.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("牛头怪", ({ "niutou guai", "niutou" }) );
	set("title", HIY "魔族" NOR);
	set("gender", "男性");
	set("age", 58);
	set("long", @LONG
这是一个满脸杀气的恶汉，两眼直露凶光。
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

        message_vision(HIR "$N" HIR "口中呵呵作响，两眼中"
                       "凶光毕露。\n" NOR, this_object(), ob);

        ::fight_ob(ob);
	if (! is_killing(ob->query("id")))
        	kill_ob(ob);
}

int accept_fight(object ob)
{
        message_vision("$N一阵狂叫，猛然扑了上来。\n",
                       this_object(), ob);
        kill_ob(ob);
        return -1;
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
        return HIR "$N" HIR "身上腾起一股火焰，登时逼得$n"
               HIR "退后几步，闷哼一声。\n" NOR;
}

void unconcious()
{
        die();
}

void die()
{
        object ob;

        ob = new("/clone/gift/cagate");
        command("chat 呀！想不到凡人也有如此厉害的！");
        message_sort(HIR "$N" HIR "吐一口鲜血，身边涌现出一股黑烟，只听叮玲玲一声"
                     "轻响，$N" HIR "掉下了一" + ob->query("unit") +
                     ob->name() + HIR "。\n", this_object());
        ob->move(environment());
        destruct(this_object());
}

void random_move()
{
	if (time() - query("born_time") > 1800)
	{
		message_vision("$N急急忙忙的走了。\n", this_object());
                CHANNEL_D->do_channel(this_object(), "rumor",
                        "听说" + name() + HIM "找上花果山水帘洞，惨"
                        "遭猴兵戏辱，已经逃回火焰山。" NOR);
		destruct(this_object());
		return;
	}
        NPC_D->random_move(this_object());
}
