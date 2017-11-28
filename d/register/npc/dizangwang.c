#include <ansi.h>

inherit NPC;

void greeting(object me);

void create()
{
        set_name("地藏王", ({ "dizang wang", "dizang", "wang" }));
        set("long", "他容貌威严，不可一世，乃是掌管人间生死的神仙。\n");
        set("title", HIR "幽冥地府生死之神" NOR);
        set("nickname", HIW "幽冥之主" NOR);
        set("gender", "男性");
        set("age", 9999);
        set("attitude", "peaceful");
        set("shen_type", 0);
        set("per", 18);
        setup();
        carry_object("/d/death/npc/obj/cloth2")->wear();
        create_family(HIR "冥府地藏王殿前" NOR, 1, "幽冥之主");
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
                command("say " + me->query("name") + "，你快快在无忧池中"
                        "洗脱筋骨(" NOR + HIY "wash" NOR + CYN ")，然后投"
                        "胎去吧！" NOR);
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

        if (undefinedp(me->query("born")) && ! objectp(present("miji", me)))
        {
                tell_object(me, WHT "\n地藏王在你耳边悄声说道：本座瞧你人不"
                                "错，这里有一本天书，相信你拿去后有用。\n" NOR);
                command("grin");
                ob = new ("/clone/misc/newbie_book");
                ob->move(me, 1);
                tell_object(me, HIC "地藏王悄悄塞了一本天书给你。\n" NOR);
                command("ke");
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

