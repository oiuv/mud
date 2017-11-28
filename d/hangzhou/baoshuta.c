#include <room.h>
inherit ROOM;

void create()
{
        set("short", "保淑塔");
        set("long", @LONG
保淑塔姿态秀丽挺拔，塔基极小，却负荷了极高的塔身。传说吴
越王钱弘淑奉召入京，久留未返，他大臣吴延爽为祝原其平安归来，
而建此塔，故名保淑塔。往南是下山的路。
LONG);
        set("exits", ([
            "southdown" : __DIR__"baoshishan",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
