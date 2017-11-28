#include <ansi.h>
inherit NPC;

int ask_back();

void create()
{
        set_name("瓦耳拉齐", ({ "waer laqi", "waer", "laqi" }));
        set("gender", "男性");
        set("age", 45);
        set("long", @LONG
他就是装神弄鬼的瓦耳拉齐。只见他面容枯槁，
由于长期不见阳光，皮肤惨白。
LONG);

        set("combat_exp", 50000);
        set("shen_type", -1);
        set("max_qi", 800);
        set("max_neili", 500);
        set("neili", 500);
        set("jiali", 10);

        set_skill("force", 120);
        set_skill("whip", 120);
        set_skill("unarmed", 120);
        set_skill("dodge", 120);
        set_skill("parry", 120);

        set("inquiry", ([
                "回去"     : (: ask_back :),
                "宝藏"     : "高昌迷宫一无所有，这一个房间是我住的。\n",
                "李文秀"   : "她是一个好姑娘，也不知何时才能再见到她。\n",
                "高昌迷宫" : "高昌迷宫一无所有，这一个房间是我住的。\n",
        ]));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 300);

        setup();
        carry_object(__DIR__"obj/liuxingchui")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object me;
        ::init();

        if (interactive(me = this_player()) && ! is_fighting()) 
        {
                remove_call_out("greeting");
                call_out("greeting", 1, me);
        }
}

void greeting(object me)
{
        if (! me || environment(me) != environment()) return;

        if (present("map", me))
        {
                message("vision", HIR "瓦耳拉齐喝道：居然敢到这里来撒野，给我受死"
                        "吧！\n" NOR, environment());
                kill_ob(me);
        } else
                command("sneer " + me->query("id"));
        return;
}

int ask_back()
{
        object ob;
        object me = this_player();

        if (! me->query_temp("marks/back"))
        {
                say(CYN "瓦耳拉齐冷笑道：好吧，这次我送你回去，下次再进来就别怪我"
                        "不客气了。\n" NOR);
                message_vision(HIY "只见瓦耳拉齐拉着$N" HIY "，在迷宫内兜了几个圈"
                        "子，快步奔出。\n" NOR, me);
                me->move("/d/gaochang/entrance");
                tell_object(me, HIC "\n你跟随瓦耳拉齐来到了高昌迷宫外。\n" NOR);
                me->set_temp("marks/back", 1);
                return 1;
        } else
        {
                say(CYN "瓦耳拉齐冷笑道：你是自作自受，在这陪我一辈子吧！\n" NOR);
                return 1;
        }
        return 1;
}

void unconcious()
{
        die();
}

