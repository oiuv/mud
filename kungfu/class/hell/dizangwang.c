// dizangwang

#include <ansi.h>

inherit NPC;

void greeting(object me);

void create()
{
        set_name("地藏王", ({ "dizang wang", "dizang" }));
        set("long", "他容貌威严，不可一世。哇！他可是掌管人间生死的神仙。\n");
        set("gender", "男性");
        set("age", 99);
        set("attitude", "peaceful");
        set("shen_type", 0);
        set("per", 18);

        set("class", "hell");
        set("title", HIR "幽冥之主" NOR);
        set("inherit_title", HIR "冥府地藏王殿前" NOR);

        setup();
        carry_object("/clone/cloth/cloth.c")->wear();
        create_family("冥府地藏王殿前", 1, "幽冥之主");
}

void init()
{
        object me;

        ::init();
        me = this_player();
        if (! objectp(me) || ! userp(me))
                return;

        greeting(me);
}

void greeting(object me)
{
        object ob;

        if (! objectp(me) || environment(me) != environment(this_object()))
                return;

        if (! query("startroom") || base_name(environment()) != query("startroom"))
                return;

        if (undefinedp(me->query("born")))
        {
                command("say " + me->query("name") + "，你快快在无忧池中洗脱筋骨(wash)，然后投胎去吧！");
        } else
        {
                if (wizardp(me))
                        command("heihei " + me->query("id"));
                else
                {
                        command("kick " + me->query("id"));
                        command("say 凡人跑到这里来干什么？");
                        message_vision("$N一脚把$n踢得无影无踪。\n\n",
                                       this_object(), me);
                        me->move(VOID_OB);
                        message_vision("\n$N跌落地上，捂着屁股哇哇叫了几声。\n",
                                       me);
                }
        }

        if (undefinedp(me->query("born")) && ! objectp(present("book", me)))
        {
                command("say 看你初来乍到，未必懂得规矩。给你一本书，你可以看看！(read book)");
                ob = new ("/clone/misc/newbie");
                ob->move(this_object());
                command("give book to " + me->query("id"));
        }
}

int attempt_apprentice(object ob)
{
        if (! ob->query("born"))
        {
                command("say 你快投胎去，在这里瞎搅和什么？");
                return 0;
        }

        command("say 滚！给我一边儿去！");
}
