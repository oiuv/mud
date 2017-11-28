#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "大厅");
        set("long", @LONG
绝情谷大厅正中摆放着一个红棕色茶几，四周并排着几个
椅子，椅背上刻有些许图案，虽单调了点，但也显得非常别致，
厅角的几盆花木散发出阵阵清香。
LONG);

        set("objects", ([
              __DIR__"npc/dizi1"  :  2,
              __DIR__"npc/dizi2"  :  2,
        ])); 
        set("exits", ([
               "out"   : __DIR__"shanzhuang",
               "north" : __DIR__"neitang",
               "west"  : __DIR__"changlang1",
               "east"  : __DIR__"xiaojing",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

