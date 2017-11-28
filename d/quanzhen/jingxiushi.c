#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "静修室");
        set("long", @LONG
这里是全真教弟子静修参悟道情的房间，房间很小，但收
拾的干干净净，桌椅都摆放得整整齐齐，让人一看就心无杂念。
LONG);
        set("exits", ([
                "east" : __DIR__"houshan",
                "south" : __DIR__"diziju",
                "west" : __DIR__"houtang3",
        ]));
        set("objects", ([
                CLASS_D("quanzhen") + "/liu" : 1,
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        mapping fam;
        object ob;

        if (! (fam = me->query("family"))
           || fam["family_name"] != "全真教")
        {
                if ((ob = present("liu chuxuan", environment(me)))
                   && living(ob)
                   && dir == "east")
                        return notify_fail(CYN "刘处玄伸手拦住你道：后面是本"
                                           "教祖师清修之地，请止步。\n" NOR);
        }
        return ::valid_leave(me, dir);
}
