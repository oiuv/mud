#include <ansi.h>
inherit NPC;

void create()
{
        set_name("麦鲸", ({ "mai jing", "mai", "jing" }));
        set("long", @LONG
这便是巨鲸帮帮主麦鲸，只见他身高七尺，满
面尽是扎须，相貌很是威猛。
LONG);
        set("attitude", "heroism");
        set("title", "巨鲸帮帮主");
        set("age", 47);

        set("max_qi", 3000);
        set("max_jing", 3000);
        set("neili", 2800);
        set("max_neili", 3000);
        set("jiali", 150);
        set("combat_exp", 1200000);
        set("score", 10000);
 
        set_skill("unarmed", 300);
        set_skill("parry", 300);
        set_skill("dodge", 300);
        set_skill("force", 300);

        setup();
        carry_object("/d/beijing/npc/obj/cloth6")->wear();
}

int accept_fight(object who)
{
        command("say 我不和你蛮打，只和你比(" HIY "compare" NOR +
                CYN ")一些水上功夫。" NOR);
        return 0;
}

int accept_hit(object who)
{
        command("say 我不和你蛮打，只和你比(" HIY "compare" NOR +
                CYN ")一些水上功夫。" NOR);
        return 0;
}

int accept_kill(object who)
{
        command("say 怎么，想得屠龙刀就非得要行凶不成？");
        return notify_fail("刹那间你觉得还是不要轻举妄动为好。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压压的挤"
                           "满了人，根本看不清楚。\n");
}

void init()
{
        add_action("do_get", "get");
        add_action("begin", "compare");
}

int begin()
{
        object me = this_player();

        if (objectp(present("yuan guangbo", environment()))) 
                return 0;

        if (me->query_condition("nishui"))
                return notify_fail("你现在正在比试呢，着急什么？\n");

        command("say 我巨鲸帮的绝技，乃是使用水上功夫。");
        command("say 如今你我各用湿泥糊嘴，比试一下水上功夫，如何？");

        message_vision(HIW "$n" HIW "和$N" HIW "各取湿泥，糊上口鼻。\n"
                       NOR, this_object(), me);

        me->set_temp("compare", 1);
        set("anti", me);

        me->apply_condition("nishui", random(4) + 3);
        this_object()->apply_condition("nishui", 50);
        call_out("guo", 6, me);
        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                message_vision(HIR "\n$N" HIR "挣扎了两下，一口气没"
                               "接上，倒在地上一动不动了。\n" NOR,
                               this_object());
                query("anti")->set_temp("win_mai", 1);
                query("anti")->delete_temp("compare");
                query("anti")->apply_condition("nishui", 0);
        }
        ::die();
}

void unconcious()
{
        if (objectp(query("anti")))
        {
                message_vision(HIR "\n$N" HIR "挣扎了两下，一口气没"
                               "接上，倒在地上一动不动了。\n" NOR,
                               this_object());
                query("anti")->set_temp("win_mai", 1);
                query("anti")->delete_temp("compare");
                query("anti")->apply_condition("nishui", 0);
        }
        ::die();
}

void guo(object me)
{
        if (objectp(present("guo sanquan", environment())))
                present("guo sanquan", environment())->begin(me);
}

int do_get(string arg)
{
        object obj/*, env, ding*/;
        string what, where;

        if (! arg)
                return 0;

        if (objectp(obj = present("yuan guangbo", environment())))
                return 0;

        if (sscanf(arg, "%s from %s", what, where) != 2)
                return 0;

        obj = this_object();

        if (where == "ding")
        {
                message_vision(CYN "$N" CYN "正色道：这位英雄请了。\n" NOR, obj);
                message_vision(CYN "$N" CYN "说道：屠龙宝刀乃不世之宝，要得此"
                               "刀，需得先过(" HIY "compare" NOR + CYN ")了我"
                               "这关。\n" NOR, obj);
                this_player()->delete_temp("compare");
                return 1;
        }
        return 0;
}