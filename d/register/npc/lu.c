#include <ansi.h>
inherit NPC;

void greeting(object me);

void create()
{
        set_name("陆天抒", ({ "lu tianshu", "lu", "tianshu"}));
        set("long", "他一脸正气，眉宇之间乃显侠义雄风。\n");
        set("gender", "男性");
        set("age", 45);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 21);

        setup();
        carry_object("/clone/cloth/cloth.c")->wear();
}

void init()
{
        object me = this_player();

        ::init();

        if (! objectp(me) || ! userp(me))
                return;

        command("hi " + me->query("id"));
        command("say 这位" + RANK_D->query_respect(me) + "，此处前去，你"
                "日后便能做一个" HIY "光明磊落" NOR + CYN "的人。" NOR);
        command("say 当今武林，看那郭靖、萧峰，皆是我辈中人。");
}

void check_leave(object me, string dir)
{
        if (dir == "out")
        {
                message_vision(CYN "$N" CYN "对$n" CYN "笑道：去吧！去吧"
                               "！\n" NOR, this_object(), me);
                me->set("character", "光明磊落");
        } else
        if (dir == "west")
        {
                command("sigh");
                command("say 可惜啊可惜，光明大道岂能不走？");
        }
}
