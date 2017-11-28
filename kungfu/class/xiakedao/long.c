// long.c

#include <ansi.h>
inherit NPC;

int ask_zhou();
int ask_back();

void create()
{
        set_name("龙岛主", ({ "long daozhu", "long" }));
        set("title", HIR "侠客岛岛主" NOR);
        set("gender", "男性");
        set("age", 60);
        set("long",
              "这是个看起来五十来岁的汉子，面眉全面，脸色红润，着一袭黄袍，昂然挺立。\n"
        );

        set_temp("apply/attack", 600);
        set_temp("apply/armor", 1500);
        set_temp("apply/damage", 800);
        set_temp("apply/unarmed_damage", 800);
        set_temp("apply/dodge", 600);
        set_temp("apply/parry", 600);

        set("qi", 9000);
        set("max_qi", 9000);
        set("jing", 20000);
        set("max_jing", 20000);
        set("neili", 15000);
        set("max_neili", 15000);
        set("jiali", 250);
        set("combat_exp", 5000000);
        set("score", 20000000);

        set_skill("force", 300);
        set_skill("taixuan-gong", 300);
        set_skill("dodge", 300);
        set_skill("taixuan-gong", 300);
        set_skill("unarmed", 300);
        set_skill("taixuan-gong", 300);
        set_skill("parry", 300);

        map_skill("force", "taixuan-gong");
        map_skill("dodge", "taixuan-gong");
        map_skill("unarmed", "taixuan-gong");
        map_skill("parry", "taixuan-gong");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: perform_action, "unarmed.taixuan" :),
        }) );

        set("chat_chance", 5);
        set("inquiry", ([
                "腊八粥" : (: ask_zhou :),
                "侠客岛" : "这个岛是我和木兄弟无意中发现的。",
                "back"   : (: ask_back :),
                "离岛"   : (: ask_back :),
        ]));

        create_family("侠客岛", 0, "岛主");
        setup();

        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && ! is_fighting() && random(3) == 1)
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! objectp(ob) || environment(ob) != environment())
                return;

        if (ob->query("combat_exp") < 10000)
              say("龙岛主抬头望了你一眼，说道：”经验尚浅。”\n");
        else
        if (ob->query("combat_exp") < 100000)
              say("龙岛主瞟了你一眼，说道：“未到火候。”\n");

        return;
}

int ask_zhou()
{
        message_sort("$N对$n说：“这是本岛特有的东西，它主要"
                     "由一味“断肠独骨腐心草”构成，要开花后"
                     "效力方著，但这种草每十年才开一次花，所"
                     "以一般人很难得到的，小兄弟想要就要看你"
                     "的缘分了！”\n", this_object(), this_player());
        return 1;
}

int ask_back()
{
        object me;

        me = this_player();
        if (me->query("combat_exp") >= 100000)
        {
                message_vision("$N冷冷的看了一会儿$n，才道：“你没长腿？”\n",
                               this_object(), me);
                return 1;
        }

        message_vision("$N叹了口气，道：“既然这样！还是让李四送你出岛吧！”\n",
                       this_object());
        me->move("/d/xiakedao/haitan");
        message("vision", "李四陪着" + me->name() + "走了过来，说了几句话，阴着脸离去了。\n",
                environment(me), me);
        tell_object(me, HIR "李四送你到海滩，冷冷道：“你这废物！"
                        "好好练好功夫，别总麻烦我们家岛主。”\n" NOR
                        "你连忙陪了几个笑脸，李四才怏怏离去。\n");
        return 1;
}
