inherit NPC;
#include <ansi.h>

void create()
{

        set_name(WHT "玄武" NOR,({"xuan wu", "xuan", "wu"}));

        set("race", "野兽");
        set("long", WHT "\n\n一只龙头龟身的庞然大物，乃四神兽之一的玄武。\n"
                        "它全身被厚厚的甲壳保护着。\n" NOR);
        set("age", 10000);
        set("attitude", "peaceful");

        set("limbs", ({ "头部", "身体", "双爪", "颈部", "翅膀" }) );
        set("verbs", ({ "bite" }) );
        set("title", HIY "神兽" NOR);

        set("combat_exp", 8000000);
        set("max_neili", 25000);
        set("neili", 25000);
        set("max_jing", 20000);
        set("jing", 20000);
        set("max_qi", 30000);
        set("qi", 30000);
        set("jingli", 15000);
        set("max_jingli", 15000);

        set("str", 40);
        set("int", 40);
        set("con", 80);
        set("dex", 20);

        set_skill("unarmed", 800);
        set_skill("sword", 800);
        set_skill("parry", 800);
        set_skill("dodge", 800);
        set_skill("force", 1000);

        set("jiali", 100);

        set_temp("apply/attack", 50);
        set_temp("apply/unarmed_damage", 50);
        set_temp("apply/armor", 1000);

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
        return WHT "玄武双足猛踏地面，顿时地动山摇，山崩地裂，"
               "四处飞沙走石，仿佛天地都要崩溃了一般。\n" NOR;
}

void die()
{
        object me;
        object jiake;

        int exp, pot;

        exp = 3000 + random(200);
        pot = 500 + random(50);

        if( objectp(me = query_last_damage_from()) &&
            me->query("wang_get/武甲") &&
            userp(me) )
        {
                message_vision(HIC "$N" HIC "从玄武的尸体上除下了一块玄武甲壳。\n", me);
                jiake = new("/d/death/obj/jiake");
                jiake->move(me);
                me->delete("wang_get/武甲", 1);
//                me->delete("wang_get/虎骨", 1);
//                me->delete("wang_get/虎皮", 1);
                me->add("combat_exp", exp);
                me->add("potential", pot);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIC "由于你斩杀神兽玄武，你获得了" + chinese_number(exp)
                                + "点经验和" + chinese_number(pot) + "点潜能。\n" NOR);
        }
        ::die();
}
