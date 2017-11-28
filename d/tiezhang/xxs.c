#include <room.h>
inherit ROOM;

void create()
{
        set("short", "休息室");
        set("long", @LONG
这是一个黑不透光的大房间。所有的窗户都用厚厚的帘子遮住，不露丝
毫光亮。屋内整齐的排列着十几张木板搭成的床铺，可以让练功后的帮众及
时得到休息。这里静悄悄的，黑暗中偶尔传来清微的鼾声。
LONG    );

        set("exits", ([
                "south" : __DIR__"zoulang-4",
        ]));

        create_door("south", "木门", "north", DOOR_CLOSED);

        set("sleep_room", 1);
        set("no_fight", 1);
        set("no_clean_up", 0);

        setup();
}