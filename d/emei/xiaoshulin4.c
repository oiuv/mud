#include <ansi.h>
inherit ROOM;

void create()
{
      	set("short","小树林");
      	set("long",@LONG
这是峨嵋山金顶华藏庵外的一片小树林。北边是峨嵋派女
弟子们的寝宫的窗户，窗下好像蹲着一个人。
LONG);
      	set("objects", ([
           	__DIR__"npc/songqingshu" : 1,
      	]));
      	set("outdoors", "emei");
      	set("exits",([
          	"northwest" : __DIR__"xiaoshulin3", 
          	"north"     : __DIR__"qinggong", 
      	]));
      	setup();
}

int valid_leave(object me, string dir)
{
        int i;
        object ob;
        me = this_player();

        if (dir == "north")
        {
                if ((string)me->query("family/family_name") != "峨嵋派"
                & objectp(present("song qingshu", environment(me))))
                        return notify_fail(CYN "宋青书一声冷喝：阁下什么"
                                           "人，在这里鬼头鬼脑的想干什么？\n" NOR);
        }
        return ::valid_leave(me, dir);
}
