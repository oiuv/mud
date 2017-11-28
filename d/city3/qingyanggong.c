#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "青羊宫");
	set("long", @LONG
青羊宫是天下第一大道观。观中林木婆娑，冠盖亭亭观中
道士匆匆来去，没人得空理你，更没人接待你。你觉得到一种
宽松的失落。
LONG);
	set("exits", ([
		"northeast" : __DIR__"westroad1",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	setup();
}

void init()
{
        object me = this_player();

        if (me->query("family/family_name") == "峨嵋派")
        {
                tell_object(me, HIG "\n你突然发现峨嵋派弟子留在此处的"
                                "密信。\n" NOR);
                me->set_temp("want_leave", 1);

                remove_call_out("letter");
                call_out("letter", 3, me);
        }
        add_action("do_back", "back");
}

void letter(object me)
{
        if (environment(me) != this_object())
                return;

        if (! me->query_temp("want_leave")) 
                return;

        tell_object(me, WHT "  ┏━━━━━━┓\n"
                            "  ┃观旁树林内有┃\n"
                            "  ┃本派密道能够┃\n"
                            "  ┃直通(" HIY "back" NOR + WHT ")峨┃\n"
                            "  ┃嵋华藏庵大殿┃\n"
                            "  ┗━━━━━━┛\n" NOR);
}

int do_back()
{
        object me = this_player();

        if (me->query_temp("want_leave")) 
        {
                message("vision", HIC "忽然间只见" + me->name() + HIC
                                  "身形一晃，竟没了踪影。\n" NOR,
                                  environment(me), ({me}));
                me->move("/d/emei/midao5");
                tell_object(me, HIC "\n你钻进了青羊观树林内的密道。\n\n" NOR);
        }
        return 1;
}
