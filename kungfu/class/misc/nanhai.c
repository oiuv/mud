// nanhai.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("南海恶蛟", ({ "monster dragon", "dragon", "nanhai ejiao" }) );
	set("title", HIC "龙族" NOR);
	set("gender", "男性");
	set("age", 23);
	set("long", @LONG
这是一个气势汹汹的恶蛟，浑身缠绕着五颜六色的异彩云祥。
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

        message_vision(HIW "$N" HIW "冷哼一声，浑身云气大盛，"
                       "妖气弥漫。\n" NOR, this_object(), ob);

        ::fight_ob(ob);
	if (! is_killing(ob->query("id")))
        	kill_ob(ob);
}

int accept_fight(object ob)
{
        message_vision("$N微一摇头，略一摆尾，扫了上来。\n",
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
        return HIY "$N" HIY "周围烟雾缭绕，光华四射，登时令$n"
               HIY "迷惑不已，难以自拔。\n" NOR;
}

void unconcious()
{
        die();
}

void die()
{
        object ob;

        ob = new("/clone/gift/ccrystal");
        command("chat 啊呀！不好，看来这次出师不利，待我回南海修炼上几年再说！");
        message_sort(HIR "$N" HIR "身子一扭，消失在云气中，"
                     "只听叮玲玲的一声，从$N" HIR "身上掉下了一" +
                     ob->query("unit") + ob->name() +
                     HIR "。\n" NOR, this_object());
        ob->move(environment());
        destruct(this_object());
}

void random_move()
{
	if (time() - query("born_time") > 1800)
	{
		message_vision("$N急急忙忙的走了。\n", this_object());
                CHANNEL_D->do_channel(this_object(), "rumor",
                        "听说" + name() + HIM "逍遥凡世，为祸人间良久"
                        "方才返回南海，百姓饱受荼毒。" NOR);
		destruct(this_object());
		return;
	}
        NPC_D->random_move(this_object());
}
