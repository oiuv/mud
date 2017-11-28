#include <ansi.h>
inherit NPC;

void greeting(object me);

void create()
{
        set_name("韦小宝", ({"wei xiaobao", "wei", "xiaobao"}));
        set("long", "他一脸顽皮像，眼神中透露着狡黠，没有半点正经。\n");
        set("gender", "男性");
        set("age", 21);
        set("attitude", "peaceful");
        set("shen_type", 1);
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

        command("xixi " + me->query("id"));
        command("say 这位" + RANK_D->query_respect(me) + "，嘿，在武林中"
                "立足，光讲仁义是万万不行的。");
        command("say 只有像我和令狐大侠那样" HIC "狡黠多变" NOR + CYN "才"
                "活得下去！" NOR);
}

void check_leave(object me, string dir)
{
        if (dir == "out")
        {
                message_vision(CYN "$N" CYN "对$n" CYN "笑道：走！多捣点"
                               "乱，那多有意思？\n" NOR, this_object(), me);
                me->set("character", "狡黠多变");
        } else
        if (dir == "north")
        {
                command("shake");
                command("say 不好玩儿。");
        }
}
