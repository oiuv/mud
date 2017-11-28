#include <ansi.h>
inherit NPC;

void greeting(object me);

void create()
{
        set_name("李自成", ({ "li zicheng", "li", "zicheng"}));
        set("long", "他面透煞气，暴戾异常，看得你心里毛毛的。\n");
        set("gender", "男性");
        set("age", 49);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("per", 20);

        setup();
        carry_object("/clone/cloth/cloth.c")->wear();
}
void init()
{
        object me = this_player();

        ::init();

        if (! objectp(me) || ! userp(me))
                return;

        command("nod " + me->query("id"));
        command("say 这位" + RANK_D->query_respect(me) + "来得正好，要得"
                "权势，就必须" HIR "心狠手辣" NOR + CYN "不可。" NOR);
        command("say 什么正派人士，全是伪君子，要把他们统统杀光！");
}

void check_leave(object me, string dir)
{
        if (dir == "out")
        {
                message_vision(CYN "$N" CYN "对$n" CYN "狂笑道：哈哈哈！"
                               "杀光那帮伪君子！\n" NOR, this_object(), me);
                me->set("character", "心狠手辣");
        } else
        if (dir == "south")
        {
                command("sneer");
                command("say 胆小鬼！");
        }
}
