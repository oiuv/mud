inherit NPC;
#include <ansi.h>

void create()
{

        set_name(HIR "朱雀" NOR,({"zhu que", "zhu", "que", "bird"}));

        set("race", "野兽");
        set("long", HIR "\n\n一只宽达丈许的浴火凤凰，乃四神兽之一的朱雀。\n"
                        "它全身羽毛血红似火，整个身体便如一团火焰。\n" NOR);
        set("age", 10000);
        set("attitude", "peaceful");

        set("limbs", ({ "头部", "身体", "双爪", "颈部", "翅膀" }) );
        set("verbs", ({ "bite" }) );
        set("title", HIY "神兽" NOR);

        set("combat_exp", 8000000);
        set("max_neili", 15000);
        set("neili", 15000);
        set("max_jing", 10000);
        set("jing", 10000);
        set("max_qi", 13000);
        set("qi", 13000);
        set("jingli", 10000);
        set("max_jingli", 10000);

        set("str", 30);
        set("int", 30);
        set("con", 20);
        set("dex", 80);

        set_skill("unarmed", 1000);
        set_skill("sword", 1000);
        set_skill("parry", 1000);
        set_skill("dodge", 1000);
        set_skill("force", 400);

        set("jiali", 150);

        set_temp("apply/attack", 300);
        set_temp("apply/unarmed_damage", 300);
        set_temp("apply/armor", 50);

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
        return HIY "朱雀双爪幻出两道金光，刹那间霹雳电闪，紫雷"
               "轰鸣，千万道闪电至九天而降，笼罩大地。\n" NOR;
}

void die()
{
        object me;
        object yumao;

        int exp, pot;

        exp = 3000 + random(200);
        pot = 500 + random(50);

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/朱羽") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从朱雀的尸体上拔下了一束羽毛。\n", me);
                yumao = new("/d/death/obj/yumao");
                yumao->move(me);
                me->delete("wang_get/朱羽", 1);
                me->add("combat_exp", exp);
                me->add("potential", pot);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIC "由于你斩杀神兽朱雀，你获得了" + chinese_number(exp)
                                + "点经验和" + chinese_number(pot) + "点潜能。\n" NOR);
        }
        ::die();
}
