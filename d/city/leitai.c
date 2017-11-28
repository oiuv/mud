#include <ansi.h>

inherit ROOM;
string look_tiaofu();

void create()
{
	set("short", "擂台");
	set("long", @LONG
这是一个四丈见方的擂台。粗壮结实的木柱撑起一片平台，
四角的支柱上高挂着四副对联，四面的观众都能清楚地看到台
上的手起脚落。梁上贴着一长条幅(tiaofu)。
LONG );
        set("outdoors", "city");
	set("item_desc", ([
		"tiaofu" : (: look_tiaofu :),
	]));

	set("exits", ([
		"eastdown"  : __DIR__"wudao1",
		"westdown"  : __DIR__"wudao2",
		"southdown" : __DIR__"wudao3",
		"northdown" : __DIR__"wudao4",
	]));
	set("objects", ([
		"/adm/npc/referee": 1,
	]));
	setup();
}

void init()
{
        add_action("do_lclose", "lclose");
        add_action("do_lopen", "lopen");
        add_action("do_invite", "invite");
        add_action("do_kickout", "kickout");
}

string look_tiaofu()
{
        object ob;

        ob = query("close_by");
        if (! objectp(ob))
                return "本擂台现在自由开放，如有兴趣自行比"
                       "武，失手伤人致命，概不负责。\n\n"
                       "注：巫师请用" HIY "lopen" NOR "/"
                       HIY "lclose" NOR "命令开放关闭擂台。\n";

        return "本擂台现在被" + ob->name(1) + "暂时关闭，"
               "组织比武，闲杂人等勿要喧哗。\n"
               "巫师请用" HIY "invite" NOR "命令邀请他人上台，"
               "或在台下使用" HIY "pass" NOR "命令\n"
               "指定某人上台比武，用" HIY "kickout" NOR
               "踢某人下台。\n";
}

int refuse(object ob)
{
        if (! wizardp(ob) && query("close_by"))
                return 1;

        return 0;
}

int do_lclose(string arg)
{
        object me;

        me = this_player();
        if (wiz_level(me) < 3)
                return notify_fail("你没有资格关闭擂台。\n");

        if (arg != "here")
                return notify_fail("如果你要关闭擂台，请输入(lclose here)。\n");

        if (objectp(query("close_by")))
                return notify_fail("这个擂台已经被" +
                                   query("close_by")->name(1) +
                                   "关闭用于比武了。\n");

        set("close_by", me);
        message("vision", HIW "【武林盛会】" + me->name(1) +
                "关闭了擂台，开始举行比武盛会。\n" NOR,
                all_interactive());
        return 1;
}

int do_lopen(string arg)
{
        object me;

        me = this_player();
        if (wiz_level(me) < 3)
                return notify_fail("你没有资格打开擂台。\n");

        if (! objectp(query("close_by")))
                return notify_fail("这个擂台目前并没有被关闭。\n");

        if (arg != "here")
                return notify_fail("如果你要打开擂台，请输入(lopen here)。\n");

        delete("close_by");
        message("vision", HIW "【武林盛会】" + me->name(1) +
                "结束了比武，重新开放了擂台。\n" NOR, all_interactive());
        return 1;
}

object *broadcast_to()
{
        if (! objectp(query("close_by")))
                return 0;

        return ({ find_object(__DIR__"wudao1"),
                  find_object(__DIR__"wudao2"),
                  find_object(__DIR__"wudao3"),
                  find_object(__DIR__"wudao4"), });
}

int do_invite(string arg)
{
        object me;
        object ob;

        me = this_player();
        if (! wizardp(me))
                return notify_fail("你不是巫师，没有资格邀请人家上来。\n");

        if (! query("close_by"))
                return notify_fail("现在擂台并没有关闭，无需特地邀请别人。\n");

        if (! arg ||
            ! objectp(ob = find_player(arg)))
                return notify_fail("你想让谁上来？\n");

        if (environment(ob) == this_object())
                return notify_fail("嗯？现在不是已经在这里了么？\n");

        if (wizardp(ob))
                return notify_fail("人家自己想上来自己会上来，不劳你费心。\n");

        if (! living(ob))
                return notify_fail("好歹你得弄醒人家吧？\n");

        message("vision", HIW + me->name() + "一声长啸：" + ob->name() +
                          "，你还不快快上来？\n" NOR, all_interactive());
        message_vision("只见$N急急忙忙的走了开去。\n", ob);
        message("vision", "只见一声呼哨，" + ob->name() + "应声跃上台来，矫健之极。\n",
                this_object());
        ob->move(this_object());
        return 1;
}

int do_kickout(string arg)
{
        object me;
        object ob;

        me = this_player();
        if (! wizardp(me))
                return notify_fail("你不是巫师，没有资格踢人家下去。\n");

        if (! arg ||
            ! objectp(ob = present(arg, this_object())))
        {
                write("你想踢谁下去？\n");
                return 1;
        }

        if (! ob->is_character())
        {
                write("你看清楚了，那并不是活人！\n");
                return 1;
        }

        message_vision("$N大喝一声，飞起一脚将$n踢得咕噜咕噜滚下台去！\n",
                       me, ob);
        if (ob->is_fighting())
                ob->remove_all_enemy(1);
        ob->move(__DIR__"wudao4");
        message("vision", "擂台上面一阵喧闹过后，只见" + ob->name() +
                          "咕噜咕噜的滚了下来，身上青一块儿紫一块儿的。\n",
                environment(ob), ({ ob }));
        return 1;
}
