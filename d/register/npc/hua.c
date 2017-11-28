#include <ansi.h>
inherit NPC;

void greeting(object me);

void create()
{
        set_name("花铁干", ({ "hua tiegan", "hua", "tiegan"}));
        set("long", "他一脸来上去大义凛然，却总让感觉有点什么不对。\n");
        set("gender", "男性");
        set("age", 41);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("per", 24);

        setup();
        carry_object("/clone/cloth/cloth.c")->wear();
}

void init()
{
        object me = this_player();

        ::init();

        if (! objectp(me) || ! userp(me))
                return;

        command("grin " + me->query("id"));
        command("say 这位" + RANK_D->query_respect(me) + "，这年头做那"
                "种什么正人君子太吃亏啦。");
        command("say 看看我，看看岳不群老哥，现今世道" HIM "阴险奸诈"
                NOR + CYN "才是做人的道理！" NOR);
}

void check_leave(object me, string dir)
{
        if (dir == "out")
        {
                message_vision(CYN "$N" CYN "对$n" CYN "奸笑道：上路吧"
                               "。\n" NOR, this_object(), me);
                me->set("character", "阴险奸诈");
        } else
        if (dir == "east")
        {
                command("sneer");
                command("say 哼，没眼光！");
        }
}
