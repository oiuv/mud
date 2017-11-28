#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "富家大堂");
        set("long", @LONG
这里是侯员外家的大堂，堂梁上挂着一块匾。堂内摆放着
些八仙桌和椅子，壁上梅兰竹菊的竹帘被挂成了兰竹菊梅，看
来这家也不过是附庸风雅的暴发户而已。
LONG);
        set("exits", ([
                "east" : __DIR__"fu-ceting",
                "west" : __DIR__"fu-zhangfang",
                "north" : __DIR__"fu-xiaoyuan",
                "south" : __DIR__"fu-houyuan",
        ]));
        setup();
        replace_program(ROOM);
}
