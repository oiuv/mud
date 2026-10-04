#include <ansi.h>
inherit ROOM;

object create_virtual_object(string key) {
    int x, y, z;

    if (!sizeof(regexp(({ key }), "^[+-]?[0-9]+,[+-]?[0-9]+(,[+-]?[0-9]+)?$")))
        return 0;
    if (sscanf(key, "%d,%d,%d", x, y, z) == 3)
        return new(base_name(this_object()), x, y, z);
    if (sscanf(key, "%d,%d", x, y) == 2)
        return new(base_name(this_object()), x, y);
    return 0;
}

varargs void create(int x, int y, int z) {
    set("short", "云端");
    set("long", HIW "
    这里是九霄云外，好神奇的地方啊，只看朵朵白云飘，让
人心旷神怡。\n");
    setArea("云端", x, y, z);
    set("exits", ([
        "north": __DIR__ "workroom/" + x + "," + (y + 1) + "," + z,
        "south": __DIR__ "workroom/" + x + "," + (y - 1) + "," + z,
        "west": __DIR__ "workroom/" + (x - 1) + "," + y + "," + z,
        "east": __DIR__ "workroom/" + (x + 1) + "," + y + "," + z,
    ]));

    if (x == 0 && y == 0) {
        addExit("down", __DIR__ "mogong");
        addExit("up", "/d/sky/tianmen");
        set("objects", ([
            // "/d/city/npc/yanruyu" : 1,
            __DIR__ "npc/LiSouci": 1,
            __DIR__ "obj/safe": 1,
        ]));
        set("sleep_room", 1);
        set("valid_startroom", 1);
    }

    setup();
}
