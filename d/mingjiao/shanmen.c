// Room: /d/mingjiao/shanmen.c
// Date: Java 97/04/3

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "明教山门");
    set("long", @LONG
一个巨大的天然石桥横跨在两片山壁之间，石桥正上方龙盘
凤舞刻着两个大字：『明教』。字迹有些剥落，看上去年代久远。
两位三十来岁的大汉手持钢剑守在山门两侧。
LONG );
    set("exits", ([
        "westup" : __DIR__"shanlu1",
        "east" : __DIR__"tomen1",
    ]));
    set("outdoors", "mingjiao");
    set("objects",([
        __DIR__"npc/jieyinshi" : 1,
        "/kungfu/class/mingjiao/lengqian" : 1,
    ]));

    setup();
}

int valid_leave(object me, string dir)
{
    object *inv;
    int i;
    if ((me->query("family/family_name") != "明教" ||
         me->query("family/family_name") != "武当派" ) &&
         dir == "westup")
    {
        inv = all_inventory(me);
        for(i=sizeof(inv)-1; i>=0; i--)
            if(inv[i]->query("weapon_prop") &&                ((string)inv[i]->query("equipped")=="wielded"))
                 if(objectp(present("leng qian", environment(me))))
                     return notify_fail("冷谦拦住你说道：这位" +
                         RANK_D->query_respect(me) + "请放下兵刃。我教教规严"
			 "厉，外客不\n得持兵刃上山。请见谅。\n");
    }
    return ::valid_leave(me, dir);
}

