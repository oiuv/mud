#include <room.h>
inherit ROOM;

void create()
{
        set("short", "练武场");
        set("long", @LONG
空阔的场地上铺满了细细的黄土，正好适合演武。四面有
几个丐帮的弟子正在练武。练武场的中心竖着几根木桩，木桩
周围还挖了若干个大沙坑。西边是兵器库。而右边有一扇小门。
LONG);
        set("outdoors", "city");
        set("exits", ([
                "west"  : __DIR__"ma_bingqi",
                "east"  : __DIR__"ma_xiaojing",
                "south" : __DIR__"ma_zoulang2",
        ]));
        set("objects", ([
                "/d/gaibang/npc/1dai" : 1 + random(2),
                "/d/gaibang/npc/2dai" : 1,
                "/d/gaibang/npc/6dai" : 1,
                "/d/gaibang/npc/7dai" : 1,
        ]));
        create_door("east", "木门", "west", DOOR_CLOSED);
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
