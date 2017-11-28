inherit NPC;
#include <ansi.h>

void create()
{

        set_name(GRN "青龙" NOR,({"qing long", "qing", "long", "dragon"}));

        set("race", "野兽");
        set("long", GRN "\n\n一条长达数十丈的神龙，乃四神兽之一。它腾\n"
                        "云驾雾，张牙舞爪，口中喷着熊熊烈火。\n" NOR);
        set("age", 10000);
        set("attitude", "peaceful");

        set("limbs", ({ "头部", "身体", "前爪", "后爪", "龙尾" }) );
        set("verbs", ({ "bite" }) );
        set("title", HIY "神兽" NOR);

        set("combat_exp", 10000000);
        set("max_neili", 20000);
        set("neili", 20000);
        set("max_jing", 20000);
        set("jing", 20000);
        set("max_qi", 25000);
        set("qi", 25000);
        set("jingli", 20000);
        set("max_jingli", 20000);

        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);

        set_skill("unarmed", 800);
        set_skill("sword", 800);
        set_skill("parry", 800);
        set_skill("dodge", 800);
        set_skill("force", 800);

        set("jiali", 100);

        set_temp("apply/attack", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 100);

        set_weight(500000000);

        setup();
}

void init()
{
        object me;

        if (interactive(me = this_player()))
        {
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, me);
        }
        ::init();
}

mixed hit_ob(object me, object ob, int damage_bouns)
{
        ob->receive_wound("qi", 200 + random(200), me);
        me->set("neili", me->query("max_neili"));
        return HIR "青龙喷出一团烈火，青龙潭内顿时扬起一片火海，潭水沸腾，似"
               "乎整个大地都要被烤焦了一般。\n" NOR;
}

void die()
{
        object me;
        object jin, dan;

        int exp, pot;

        exp = 3000 + random(200);
        pot = 500 + random(50);

        jin = new("/d/death/obj/longjin");
        dan = new("/d/death/obj/longdan");

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/龙胆") &&
            me->query("wang_get/龙筋") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从青龙的尸体上除下了一根龙筋和"
                               "一只龙胆。\n", me);
                jin->move(me);
                dan->move(me);
                me->delete("wang_get/龙胆", 1);
                me->delete("wang_get/龙筋", 1);
                me->add("combat_exp", exp);
                me->add("potential", pot);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIC "由于你斩杀神兽青龙，你获得了" + chinese_number(exp)
                                + "点经验和" + chinese_number(pot) + "点潜能。\n" NOR);
        }

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/龙胆") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从青龙的尸体上除下了一只龙胆。\n", me);
                dan->move(me);
                me->delete("wang_get/龙胆", 1);
                me->add("combat_exp", exp);
                me->add("potential", pot);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIC "由于你斩杀神兽青龙，你获得了" + chinese_number(exp)
                                + "点经验和" + chinese_number(pot) + "点潜能。\n" NOR);
        }

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/龙筋") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从青龙的尸体上除下了一根龙筋。\n", me);
                jin->move(me);
                me->delete("wang_get/龙筋", 1);
        }

        ::die();
}
