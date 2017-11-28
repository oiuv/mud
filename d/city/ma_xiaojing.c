#include <room.h>
inherit ROOM;

void create()
{
        set("short", "小径");
        set("long", @LONG
小路是用五彩缤纷的石子铺成的。石子组成各种花纹，甚
是好看。路边池塘里荷花亭亭，蜻蜓飞来飞去，只有偶尔传来
的几声蛙鸣打破了四周的宁静。
LONG);
        set("outdoors", "city");
        set("exits", ([
                "west"  : __DIR__"ma_lianwu1",
                "east"  : __DIR__"ma_huayuan",
        ]));
        create_door("west", "木门", "east", DOOR_CLOSED);
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
