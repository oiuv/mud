#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "庭院");
        set("long", @LONG
这里是万安寺的西院，打扫得非常干净。大院两旁是几间大屋，全以松
木搭成，极大的木柱，木料均不去皮，天然质朴，却与大院正对的一座金碧
辉煌的殿堂截然不同，这里到处都是蒙古兵，戒备很是深严。
LONG );
        set("exits", ([
                "east" : __DIR__"was_dayuan",
        ]));

        set("objects", ([
                __DIR__"npc/bing1" : 5,
        ]));

        set("outdoors", "beijing");
        setup();
}


