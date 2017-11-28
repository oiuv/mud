// Copyright (C) 2003, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

#include <room.h>
inherit ROOM;

void create()
{
        set("short", "监狱");
        set("long", @LONG
这里是监狱，约莫两丈见方的一间大石室，墙壁和顶板都是大石所砌。
墙角里放着一只粪桶，鼻中闻到的尽是臭气和霉气。从西面墙上的小窗望
去，可以见到翰林府的一角。
LONG );

        set("exits", ([
                "west" : __DIR__"ymzhengting",
        ]));
        set("objects", ([
                __DIR__"npc/dingdian" : 1,
        ]));

        create_door("west", "铁门", "east", DOOR_CLOSED);
	setup();
        replace_program(ROOM);
}


