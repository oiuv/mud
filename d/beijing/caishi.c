#include <room.h>
inherit ROOM;

void create()
{
        set("short", "北街菜市");
        set("long", @LONG
这里是京城西单北大街西边的一个菜市，青石板铺砌着地面。街的两边摆
满了蔬菜摊和水果摊, 小贩门大声吆喝着，京城的百姓都是从这儿把每天所需
的食物购回, 做成一顿顿可口的佳肴。
LONG );
       set("exits", ([
                "east" : __DIR__"bei_3",
        ]));
        set("objects", ([
                __DIR__"npc/caifan" : 1,
                __DIR__"npc/jumin1" : 2,
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}
