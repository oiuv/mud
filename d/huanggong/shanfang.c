//shanfang.c 御膳房

#include <ansi.h>

inherit ROOM;

void create() {
    set("short", "御膳房");
    set("long", @LONG
皇宫里的膳食与平常民间的自然不同,这里就是负责皇上用膳的御
膳房.你不禁想把这里的美味都尝一遍,可别忘了这可是皇宫啊.
LONG
    );
    set("exits", ([
        "north": __DIR__ "tinglang2",
    ]));
    set("objects", ([
        "/d/items/food/yuchi": 2,
        "/d/items/liquid/nverhong": 1,
    ]));
    setup();
    replace_program(ROOM);
}
