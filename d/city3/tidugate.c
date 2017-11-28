#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "提督府门");
	set("long", @LONG
这便是提督府门。巍峨雄伟的城墙上，成都提督府五个大
字十分显眼，气势辉煌。几名亲兵立在两旁。
LONG);
        set("outdoors", "chengdu");
	set("exits", ([
	    "south" : __DIR__"guangchang",
	    "north" : __DIR__"tidufu",
	]));
	set("objects", ([
	    __DIR__"npc/qinbing" : 2,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
//	int i;
        object bing;

        bing = present("qin bing", environment(me));
        if (dir != "north" || ! objectp(bing) || ! living(bing))
                return ::valid_leave(me, dir);

        if (me->query("weiwang") >= 10000)
        {
                message_vision(CYN "$N" CYN "笑道：" + RANK_D->query_respect(me) +
                               "请进，请进！这就去让人通报。\n" NOR, bing, me);
                return ::valid_leave(me, dir);
        }

        if (me->query("special_skill/trick"))
        {
                message_vision(CYN "$N" CYN "看见$n" CYN "走了过来，刚想拦住，却"
                               "听$n" CYN "一声断喝：给我散开！\n$N" CYN "不由得"
                               "吓了一跳，讪讪的不敢说话。\n" NOR, bing, me);
                return ::valid_leave(me, dir);
        }

	return notify_fail(CYN "亲兵上前挡住你，朗声说道：这位" +
                           RANK_D->query_respect(me) + "请回吧。老爷不见客。\n" NOR);
}