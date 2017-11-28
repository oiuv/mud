#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "庭院");
        set("long", @LONG
这里是万安寺的西院，打扫得非常干净。大院两旁是几间大屋，全以松木搭
成，极大的木柱，木料均不去皮，天然质朴，却与大院正对的一座金碧辉煌的殿
堂截然不同，这里到处都是蒙古兵，戒备很是深严。
LONG );
        set("exits", ([
                "west" : "/d/tulong/yitian/was_dayuan",
        ]));

        set("objects", ([
                "/d/tulong/yitian/npc/bing1" : 5,
        ]));

        set("outdoors", "beijing");
        setup();
}


