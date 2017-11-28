#include <ansi.h>
inherit NPC;

void greeting(object me);
int do_register(string arg);
int do_decide(string arg);

void create()
{
        set_name("水笙", ({ "shui sheng", "shui", "sheng"}));
        set("long", "她轻妆淡抹，眉目之中深深的透露哀思。\n");
        set("gender", "女性");
        set("age", 22);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 25);

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

void init()
{
        object me;

        ::init();
        me = this_player();
        if (! objectp(me) || ! userp(me))
                return;

        add_action("do_register", "register");
        add_action("do_decide", "decide");

        remove_call_out("greeting");
        call_out("greeting", 0, me);
}

void greeting(object me)
{
        if (! objectp(me) || environment(me) != environment(this_object()))
                return;

        if (! me->query("registered"))
        {
                message_vision("\n", me);
                command("whisper " + me->query("id") + " 你还没有注册信箱，赶快"
                        "注册(" HIY "register" NOR + WHT ")吧。\n请你务必注册一"
                        "个你确定能够收取电子信件的地址，以备口令丢失的时\n候能"
                        "够收取更新口令。\n");
                return;
        }

        if (! stringp(me->query("character")))
        {
                command("whisper " + me->query("id") + " 你还没有选择品质，快去"
                        "附近选选吧。");
                command("whisper " + me->query("id") + " 关于如何选择理想的天赋"
                        "，你可以看看(" HIY "help gift" NOR + WHT ")帮助文件。" NOR);
                return;
        }

        if (! wizardp(me))
        {
                command("tell " + me->query("id") + " 咦，你怎么跑到这里来了？");
                if (! stringp(me->query("born")))
                {
                        message_vision("$N被昏昏沉沉的扔了出去。\n", me);
                        me->delete("born");
                        me->move("/d/register/yanluodian");
                        message_vision("啪的一声，$N被扔到了地上。\n", me);
                        return;
                }
                message_vision("$N被昏昏沉沉的扔了出去。\n", me);
                me->move(VOID_OB);
                message_vision("啪的一声，$N被扔到了地上。\n", me);
                return;
        }

        command("look " + me->query("id"));
}

int do_register(string arg)
{
        object me;
        string id, address;

        if (! objectp(me = this_player()))
                return 0;

        if (me->query("registered"))
        {
                command("say 你不是已经注册过了吗？不用再注册了。");
                return 1;
        }

        if (! arg || ! stringp(arg))
        {
                command("shake " + me->query("id"));
                command("say 注册的email地址你得给我啊。请输入" HIY "register" NOR +
                        CYN "你的email地址。" NOR);
                return 1;
        }

        if (strlen(arg) > 64 || sscanf(arg, "%s@%s", id, address) != 2)
        {
                command("say 我怎么没有见过这么怪的email地址？你看看清楚好吗？");
                return 1;
        }
        me->set_temp("email", arg);

        command("nod " + me->query("id"));

        tell_object(me, HIR "\n请注意，由于本站没有采用mail确认，所以你即使注册个你无法收信的
地址，系统也不能识别。当你决定下采用这个信箱地址以后，它将成为
确认你身份的唯一途径，注册的信箱地址是永不改变的。当你丢失了密
码以后系统管理人员可以将修改后的口令发送到你所注册的信箱中，如
果你出于某种目的不愿意注册你的信箱，那么管理人员将不再为你的密
码担负任何责任，这意味着你必须自己保管好你的密码。你注册的地址
为(" NOR + HIY + arg + NOR + HIR ")，如无错误，请输入(" NOR +
HIY "decide" NOR + HIR ")决定。\n\n" NOR);

        return 1;
}

int do_decide(string arg)
{
        object me;

        if (! objectp(me = this_player()))
                return 0;

        if (me->query("registered"))
        {
                command("say 行了行了，我已经知道你的地址了，不用再说啦！\n");
                return 1;
        }

        if (! stringp(me->query_temp("email")))
        {
                command("say 你要决定什么？是决定注册吗？要是那"
                        "样请你先注册你的email地址。");
                return 1;
        }

        command("say 好了！你的email地址已经注册了！现在快去附近选你的品质吧。");
        command("say 关于天赋的选择，你可以看看(" HIY "help gift" NOR + CYN ")帮助文件。" NOR);
        me->set("email", me->query_temp("email"));
        me->set("registered", 1);
        me->save();
        return 1;
}
