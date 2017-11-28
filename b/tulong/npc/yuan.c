#include <ansi.h>
inherit NPC;

void create()
{
        set_name("元广波", ({ "yuan guangbo", "yuan", "guangbo" }));
        set("long", @LONG
这便是海沙派的总舵主元广波，只见他目光如
电，身材彪捍，雄伟之极。
LONG);
        set("attitude", "heroism");
        set("title", "海沙派总舵主");
        set("age", 35);

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
                CYN ")一些我海沙帮的绝技。" NOR);
        return 0;
}

int accept_hit(object who)
{
        command("say 我不和你蛮打，只和你比(" HIY "compare" NOR +
                CYN ")一些我海沙帮的绝技。" NOR);
        return 0;
}

int accept_kill(object who)
{
        command("say 怎么，想得屠龙刀就非得要行凶不成？");
        return notify_fail("刹那间你觉得还是不要轻举妄动为好。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压压的挤满了"
                           "人，根本看不清楚。\n");
}

void init()
{
        add_action("do_get", "get");
        add_action("begin", "compare");
}

int begin()
{
        object me = this_player();

        if (objectp(present("chang jinpeng", environment())))
                return 0;

        if (me->query_condition("duyan"))
                return notify_fail("你现在正在比试呢，着急什么？\n");

        command("sneer");
        command("say 我海沙帮的绝技乃是毒盐害人，如今你我各吃"
                "一碗，如何？");

        message_vision(HIW "$N" HIW "叫手下装了两大碗毒盐，$N"
                       HIW "和$n" HIW "各吃一碗。\n" NOR,
                       this_object(), me);

        me->set_temp("compare", 1);
        set("anti", me);

        me->apply_condition("duyan", random(4) + 3);
        this_object()->apply_condition("duyan", 50);
        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                command("say 佩服，佩服……");
                message_vision(HIR "\n$N" HIR "嘶哑着嗓子干嚎了两声，双眼"
                               "翻白跌倒在地，口中吐出些白沫，就再也没动了"
                               "。\n" NOR, this_object());
                query("anti")->set_temp("win_yuan", 1);
                query("anti")->delete_temp("compare");
        }
        ::die();
}

void unconcious()
{
        if (objectp(query("anti")))
        {
                command("say 佩服，佩服……");
                message_vision(HIR "\n$N" HIR "嘶哑着嗓子干嚎了两声，双眼"
                               "翻白跌倒在地，口中吐出些白沫，就再也没动了"
                               "。\n" NOR, this_object());
                query("anti")->set_temp("win_yuan", 1);
                query("anti")->delete_temp("compare");
        }
        ::die();
}

int do_get(string arg)
{
        object obj/*, env, ding*/;
        string what, where;

        if (! arg)
                return 0;

        if (objectp(obj = present("chang jinpeng", environment(this_object()))))
                return 0;

        if (sscanf(arg, "%s from %s", what, where) != 2)
                return 0;

        obj = this_object();

        if (where == "ding")
        {
                message_vision(CYN "$N" CYN "喝道：无耻小贼，给我住手。你凭"
                               "什么得此宝刀？\n" NOR, obj,this_player());
                message_vision(CYN "$N" CYN "冷冷地说道：要得此刀，先比(" HIY
                               "compare" NOR + CYN ")赢了我再说。\n" NOR,
                               obj, this_player());
                this_player()->delete_temp("compare");
                return 1;
        }
        return 0;
}
