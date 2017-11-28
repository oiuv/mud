#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "林中小路");
        set("long", @LONG
你走在一条僻静的林中小路上，两旁是阴森森的树林。只
见左右前后，到处都是铺天盖地的松树林。几十丈高的大松树
簇在一块，密实的枝叶象一蓬蓬巨伞般伸向天空，把阳光遮得
丝毫也无。据说这里经常有土匪出没，不可久留。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
                "south"     : __DIR__"tufeiwo2",
                "northdown" : __DIR__"wdroad10",
        ]));
        set("objects", ([
                __DIR__"npc/tufei2" : 2
        ]));
        setup();
        replace_program(ROOM);
}
