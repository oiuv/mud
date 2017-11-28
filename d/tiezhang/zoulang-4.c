#include <room.h>
inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
你走在一条走廊上。北面似乎有个黑暗的小屋，还隐隐传来一些酣声。
LONG    );
        set("exits", ([ 
                "west" : __DIR__"zoulang-1",
                "north" : __DIR__"xxs",
        ]));

        create_door("north", "木门", "south", DOOR_CLOSED);

        set("no_clean_up", 0);

        setup();
}