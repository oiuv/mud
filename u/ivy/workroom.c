#include <ansi.h>
inherit ROOM;

varargs void create(int x, int y, int z)
{
    set("short", "云端");
    set("long", HIW"
    这里是九霄云外，好神奇的地方啊，只看朵朵白云飘，让
人心旷神怡。\n");
    setArea(x, y, z, "云端");
    set("exits", ([
        "north":__DIR__ "workroom/" + x + "," + (y + 1) + "," + z,
        "south":__DIR__ "workroom/" + x + "," + (y - 1) + "," + z,
        "west":__DIR__ "workroom/" + (x - 1) + "," + y + "," + z,
        "east":__DIR__ "workroom/" + (x + 1) + "," + y + "," + z,
    ]));

    if (x == 0 && y == 0)
    {
        addExit("down", __DIR__ "mogong");
        addExit("up", "/d/sky/tianmen");
        set("objects",([
            "/d/city/npc/yanruyu" : 1,
        ]));
    }

    /*
    set("objects",([
        __DIR__"clone/beast/qilin" : 1,
    ]));
    */

    //MOYE->come_here();

    set("valid_startroom", 1);
    set("sleep_room", 1);
    setup();
}
