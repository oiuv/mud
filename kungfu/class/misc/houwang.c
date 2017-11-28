#include <ansi.h>
inherit NPC;

void create()
{
        set_name("猴王", ({ "hou wang", "hou", "wang", "monkey" }));
        set("race", "野兽");
        set("age", 23);
        set("long", "这是一只身材硕壮的大马猴，眼神中透露出一股霸\n"
                    "气，看起来极不好惹。\n");
        set("rank_info/rude", "孽畜");
        set("rank_info/respect", "大猴子");
        set("combat_exp", 3000000);
        set("attitude", "heroism");
        set("str", 80);
        set("int", 10);
        set("con", 80);
        set("dex", 80);

        set("max_neili", 5000);
        set("neili", 5000);
        set("max_jing", 4000);
        set("jing", 4000);
        set("max_qi", 6000);
        set("qi", 6000);
        set("jingli", 3000);
        set("max_jingli", 3000);
        set("jiali", 300);

        set_skill("cuff", 250);
        set_skill("mizong-houquan", 250);
        set_skill("parry", 250);
        set_skill("dodge", 250);
        set_skill("force", 250);

        map_skill("cuff", "mizong-houquan");
        prepare_skill("cuff", "mizong-houquan"); 

        set_temp("apply/attack",  200);
        set_temp("apply/defense", 300);
        set_temp("apply/damage",  300);
        set_temp("apply/unarmed_damage", 300);
        set_temp("apply/armor", 500);

        set("chat_chance", 30);
        set("chat_msg", ({
                (: random_move :)
        }));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.x" :),
        }));
        setup();

        if (random(10) == 1)
                set_temp("handing", carry_object("/d/emei/obj/pantao"));

}

int accept_object(object me, object ob)
{
        if (! ob->query("food_supply"))
        {
                message_vision(CYN "$N" CYN "摆了摆手，吱吱吱吱一阵"
                               "乱叫。\n" NOR, this_object());
                return 0;
        }

	if (query("food") >= max_food_capacity() - ob->query("food_supply"))
        {
                message_vision(CYN "$N" CYN "伸长脖子嗅嗅，摆了摆手"
                               "，打了一个饱嗝。\n" NOR, this_object());

        	if (present("pan tao", this_object()))
		{
                	message_vision(CYN "\n$N" CYN "挠了挠头，从身后摸出"
                                       "个水灵灵的大蟠桃，又嗅了嗅。\n" NOR,
                                       this_object());

		        command("give pan tao to " + me->query("id"));
		        command("hehe");
		}
                return 0;
        }

        message_vision(CYN "$N" CYN "一把抓过$n" NOR + CYN "，使劲嗅了嗅。\n"
                       NOR, this_object(), ob);

        // 必须提前转移物件，否则下面的指令无效
	ob->move(this_object());

      	command("eat " + ob->query("id"));
        command("stuff");
        command("shzi");
        return 1;
}

int accept_fight(object ob)
{
        message_vision(CYN "$N" CYN "朝着$n" CYN "吱吱吱吱一阵乱叫。"
                       "\n" NOR, this_object(), ob);
        return 0;
}

void fight_ob(object ob)
{
        if (is_fighting(ob))
                return;

        message_vision(HIW "$N" HIW "仰天一声长哮，朝$n" HIW "猛扑了"
                       "上去。\n" NOR, this_object(), ob);

        ::fight_ob(ob);
        if (! is_killing(ob->query("id")))
                kill_ob(ob);
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
        ob->receive_wound("qi", 80 + random(50), me);
        ob->set_temp("can_learn/houwang", 1);
        return random(2) ? HIY "陡然间$N" HIY "招式一变，腾空跃起，双"
                           "爪竟似幻作两道金光，宛若星划长空，飕的抓向"
                           "$n" HIY "而去。\n" NOR:

                           HIY "$N" HIY "蓦地里一声清啸，双拳回圈斜挥"
                           "而出，招式煞为精奇。$n" HIY "登时只觉眼花"
                           "缭乱，难以招架。\n" NOR;
}

void unconcious()
{
        object ob;

        if (objectp(ob = query_last_damage_from())
           && ! ob->query_skill("mizong-houquan", 1)
           && ob->query_temp("can_learn/houwang", 1) > 30
           && ob->query("combat_exp") > 100000
           && ob->query_skill("cuff", 1) > 100
           && ob->query_skill("force", 1) > 100
           && ob->query("max_neili") > 1200
           && ob->query("int", 1) > 26
           && ob->query("dex", 1) > 24
           && random(10) == 1
           && userp(ob))
        {
	        tell_object(ob, HIW "\n你通过和猴王格斗，突然间灵光一"
                                "闪，领悟出了猴拳的真诣所在。\n\n" NOR +
                                HIC "恭喜你练成了「迷踪猴拳」。\n" NOR);
                ob->set_skill("mizong-houquan", 49);
                ob->improve_skill("mizong-houquan", 1500000);
                ob->improve_skill("martial-cognize", 1500000);
        }
        ::die();
}
