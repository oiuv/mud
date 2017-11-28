inherit NPC;
#include <ansi.h>

void create()
{

        set_name(HIW "白虎" NOR,({"bai hu", "bai", "hu", "tiger"}));

        set("race", "野兽");
        set("long", HIW "\n\n一只长达丈许的巨型猛虎，乃四神兽之一的白虎。\n"
                        "它全身毛皮洁白无暇，很是高贵。\n" NOR);
        set("age", 10000);
        set("attitude", "peaceful");

        set("limbs", ({ "头部", "身体", "前爪", "后爪", "虎尾" }) );
        set("verbs", ({ "bite" }) );
        set("title", HIY "神兽" NOR);

        set("combat_exp", 8000000);
        set("max_neili", 18000);
        set("neili", 18000);
        set("max_jing", 18000);
        set("jing", 18000);
        set("max_qi", 22000);
        set("qi", 22000);
        set("jingli", 18000);
        set("max_jingli", 18000);

        set("str", 45);
        set("int", 45);
        set("con", 45);
        set("dex", 45);

        set_skill("unarmed", 800);
        set_skill("sword", 800);
        set_skill("parry", 800);
        set_skill("dodge", 800);
        set_skill("force", 800);

        set("jiali", 100);

        set_temp("apply/attack", 150);
        set_temp("apply/unarmed_damage", 150);
        set_temp("apply/armor", 150);

        set_weight(500000000);

        setup();
}

void init()
{
        object me,ob;

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
        return HIW "白虎喷出一团寒气，刹时地面冰封九尺，四周冰雪"
               "纷飞，似乎连空气都要被冻住一般。\n" NOR;
}

void die()
{
        object me;
        object gu, pi;

        int exp, pot;

        exp = 3000 + random(200);
        pot = 500 + random(50);

        gu = new("/d/death/obj/hugu");
        pi = new("/d/death/obj/hupi");

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/虎骨") &&
            me->query("wang_get/虎皮") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从白虎的尸体上除下了一张白虎"
                               "皮和一根虎骨。\n", me);
                gu->move(me);
                pi->move(me);
                me->delete("wang_get/虎骨", 1);
                me->delete("wang_get/虎皮", 1);
                me->add("combat_exp", exp);
                me->add("potential", pot);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIC "由于你斩杀神兽白虎，你获得了" + chinese_number(exp)
                                + "点经验和" + chinese_number(pot) + "点潜能。\n" NOR);
        }

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/虎骨") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从白虎的尸体上除下了一根虎骨。\n", me);
                gu->move(me);
                me->delete("wang_get/虎骨", 1);
                me->add("combat_exp", exp);
                me->add("potential", pot);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIC "由于你斩杀神兽白虎，你获得了" + chinese_number(exp)
                                + "点经验和" + chinese_number(pot) + "点潜能。\n" NOR);
        }

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/虎皮") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从白虎的尸体上除下了一张白虎皮。\n", me);
                pi->move(me);
                me->delete("wang_get/虎皮", 1);
        }

        ::die();
}
